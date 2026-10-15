param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

$git = "$env:LOCALAPPDATA\Programs\MinGit\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

Write-Host "Configuring remote origin to $RepoUrl..." -ForegroundColor Cyan
& $git remote remove origin 2>$null
& $git remote add origin $RepoUrl
& $git branch -M main

Write-Host "Pushing branch 'main' to GitHub..." -ForegroundColor Cyan
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Code successfully pushed to GitHub: $RepoUrl" -ForegroundColor Green
} else {
    Write-Host "`n[NOTICE] If authentication failed, please ensure your GitHub Personal Access Token or SSH Key is configured." -ForegroundColor Yellow
}
