# Simple GitHub Upload Script
# Run in PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "GITHUB UPLOAD" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

cd "d:\web ita-sochi"

Write-Host "1. Check status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "2. Add files..." -ForegroundColor Yellow
git add .
Write-Host "   OK: Files added" -ForegroundColor Green
Write-Host ""

Write-Host "3. Create commit..." -ForegroundColor Yellow
git commit -m "feat: Add interactive solutions and cyber-tronic typography"
Write-Host "   OK: Commit created" -ForegroundColor Green
Write-Host ""

Write-Host "4. Push to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "   OK: Upload complete" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Green
Write-Host "DONE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository:" -ForegroundColor Cyan
Write-Host "https://github.com/akoffice933-maker/web-ita-sochi"
Write-Host ""
Write-Host "GitHub Pages:" -ForegroundColor Cyan
Write-Host "https://akoffice933-maker.github.io/web-ita-sochi/"
Write-Host ""

Read-Host "Press Enter to exit"
