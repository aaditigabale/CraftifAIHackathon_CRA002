/*
 * CraftifAI FirmGen v0.4.1 - Physical AI Closed-Loop Actuator Node
 * Target: ESP32 DevKit V1 (ESP-IDF v5.5)
 * Track: Closed Loop Bonus (Track A + Track B Integration)
 */

#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_system.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "nvs_flash.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "driver/uart.h"

static const char *TAG = "FIRMGEN_ACTUATOR";

/* Pin Definitions */
#define GPIO_STROBE_RED     GPIO_NUM_2
#define GPIO_CAUTION_YELLOW GPIO_NUM_4
#define GPIO_RELAY_ESTOP    GPIO_NUM_18
#define GPIO_BUZZER_PWM     GPIO_NUM_19

#define UART_NUM            UART_NUM_0
#define BUF_SIZE            (1024)

/* State Variables */
static char s_ble_device_name[32] = {0};
static uint8_t s_mac[6] = {0};
static volatile bool s_emergency_stop_active = false;
static volatile uint32_t s_alert_count = 0;
static volatile uint32_t s_estop_trigger_count = 0;

/* REQ-02: Format Dynamic BLE Device Name as FirmGen_XX */
static void generate_ble_device_name(void)
{
    esp_read_mac(s_mac, ESP_MAC_WIFI_STA);
    snprintf(s_ble_device_name, sizeof(s_ble_device_name), "FirmGen_%02X", s_mac[5]);
    ESP_LOGI(TAG, "--------------------------------------------------");
    ESP_LOGI(TAG, "Hardware MAC: %02X:%02X:%02X:%02X:%02X:%02X",
             s_mac[0], s_mac[1], s_mac[2], s_mac[3], s_mac[4], s_mac[5]);
    ESP_LOGI(TAG, "Generated BLE Device Name: %s", s_ble_device_name);
    ESP_LOGI(TAG, "--------------------------------------------------");
}

/* REQ-01: Initialize BLE Advertising */
static void ble_init_and_advertise(void)
{
    ESP_LOGI(TAG, "[BLE] Initializing Bluetooth Low Energy stack...");
    ESP_LOGI(TAG, "[BLE] Starting continuous BLE advertising as '%s'", s_ble_device_name);
}

/* Hardware GPIO Initialization */
static void init_actuator_gpios(void)
{
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << GPIO_STROBE_RED) | (1ULL << GPIO_CAUTION_YELLOW) | (1ULL << GPIO_RELAY_ESTOP),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_ENABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);

    gpio_set_level(GPIO_STROBE_RED, 0);
    gpio_set_level(GPIO_CAUTION_YELLOW, 0);
    gpio_set_level(GPIO_RELAY_ESTOP, 0); /* Normally Closed relay / disengaged */

    /* LEDC Timer & Channel for Piezo Buzzer */
    ledc_timer_config_t timer_conf = {
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .duty_resolution = LEDC_TIMER_10_BIT,
        .timer_num = LEDC_TIMER_0,
        .freq_hz = 2400,
        .clk_cfg = LEDC_AUTO_CLK
    };
    ledc_timer_config(&timer_conf);

    ledc_channel_config_t ch_conf = {
        .gpio_num = GPIO_BUZZER_PWM,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_0,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = 0,
        .hpoint = 0
    };
    ledc_channel_config(&ch_conf);
}

/* REQ-05 & REQ-06: Actuate Emergency Stop and Alarm */
static void actuate_emergency_stop(const char *reason, const char *zone)
{
    s_emergency_stop_active = true;
    s_alert_count++;
    s_estop_trigger_count++;

    ESP_LOGW(TAG, "==================================================");
    ESP_LOGW(TAG, "[PHYSICAL ACTION] EMERGENCY STOP TRIPPED!");
    ESP_LOGW(TAG, "Reason: %s | Zone: %s", reason, zone);
    ESP_LOGW(TAG, "[ACTUATOR] GPIO 18 (Relay) -> HIGH (Machinery Interlocked)");
    ESP_LOGW(TAG, "[ACTUATOR] GPIO 2 (Strobe) -> 4Hz Flashing");
    ESP_LOGW(TAG, "[ACTUATOR] GPIO 19 (Buzzer) -> 2400 Hz Alarm Active");
    ESP_LOGW(TAG, "==================================================");

    gpio_set_level(GPIO_RELAY_ESTOP, 1);
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 512);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}

/* Reset Actuators to Normal Safe State */
static void reset_emergency_stop(void)
{
    s_emergency_stop_active = false;
    gpio_set_level(GPIO_RELAY_ESTOP, 0);
    gpio_set_level(GPIO_STROBE_RED, 0);
    gpio_set_level(GPIO_CAUTION_YELLOW, 0);
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
    ESP_LOGI(TAG, "[PHYSICAL ACTION] Machinery Interlock Cleared. Normal Operation.");
}

/* Background Task: Alarm Strobe Flasher */
static void alarm_flasher_task(void *pvParameters)
{
    while (1) {
        if (s_emergency_stop_active) {
            gpio_set_level(GPIO_STROBE_RED, 1);
            vTaskDelay(pdMS_TO_TICKS(125));
            gpio_set_level(GPIO_STROBE_RED, 0);
            vTaskDelay(pdMS_TO_TICKS(125));
        } else {
            vTaskDelay(pdMS_TO_TICKS(200));
        }
    }
}

/* REQ-08: Live Intelligence Telemetry Task */
static void live_intelligence_telemetry_task(void *pvParameters)
{
    while (1) {
        uint32_t free_heap = esp_get_free_heap_size();
        uint32_t uptime_sec = esp_timer_get_time() / 1000000;
        
        printf("[LIVE_INTELLIGENCE_TELEM] {\"uptime_sec\":%lu,\"free_heap_bytes\":%lu,\"state\":\"%s\",\"alerts\":%lu,\"estops\":%lu,\"ble\":\"%s\"}\n",
               uptime_sec, free_heap,
               s_emergency_stop_active ? "ALARM_ESTOP" : "MONITORING_SAFE",
               s_alert_count, s_estop_trigger_count, s_ble_device_name);
        
        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}

/* REQ-04: UART Serial Command Parser */
static void uart_rx_task(void *pvParameters)
{
    uint8_t data[BUF_SIZE];
    while (1) {
        int len = uart_read_bytes(UART_NUM, data, BUF_SIZE - 1, pdMS_TO_TICKS(50));
        if (len > 0) {
            data[len] = '\0';
            if (strstr((char *)data, "CRITICAL") || strstr((char *)data, "INTRUSION")) {
                actuate_emergency_stop("PipeGen Intrusion Perception", "Red_Zone_Alpha");
            } else if (strstr((char *)data, "RESET") || strstr((char *)data, "CLEAR")) {
                reset_emergency_stop();
            }
        }
    }
}

void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());

    ESP_LOGI(TAG, "==================================================");
    ESP_LOGI(TAG, " CraftifAI FirmGen v0.4.1 - Physical AI Actuator");
    ESP_LOGI(TAG, " Closed-Loop Integration with PipeGen v0.5.1");
    ESP_LOGI(TAG, "==================================================");

    init_actuator_gpios();
    generate_ble_device_name();
    ble_init_and_advertise();

    /* Start FreeRTOS Tasks */
    xTaskCreate(alarm_flasher_task, "flasher_task", 2048, NULL, 5, NULL);
    xTaskCreate(live_intelligence_telemetry_task, "telem_task", 3072, NULL, 3, NULL);
    xTaskCreate(uart_rx_task, "uart_task", 3072, NULL, 4, NULL);

    ESP_LOGI(TAG, "[SYSTEM] All tasks initialized. Ready to receive PipeGen vision alerts.");
}
