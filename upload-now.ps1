$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"
$localFile = "d:\web ita-sochi\pages\interaktiv-simple.html"
$remoteFile = "/pages/interaktiv.html"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "UPLOADING INTERACTIV PAGE" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "From: $localFile"
Write-Host "To: $ftpServer$remoteFile"
Write-Host ""

try {
    $request = [System.Net.FtpWebRequest]::Create("$ftpServer$remoteFile")
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $request.UsePassive = $true
    $request.UseBinary = $true
    
    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $request.ContentLength = $fileContent.Length
    
    Write-Host "Uploading $($fileContent.Length) bytes..." -ForegroundColor Yellow
    
    $requestStream = $request.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open in browser:" -ForegroundColor Cyan
    Write-Host "http://school-board.online/pages/interaktiv.html"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check:" -ForegroundColor Yellow
    Write-Host "1. Internet connection"
    Write-Host "2. FTP credentials"
    Write-Host "3. File exists: $localFile"
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
