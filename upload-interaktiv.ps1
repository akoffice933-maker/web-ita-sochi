$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"
$localFile = "d:\web ita-sochi\pages\interaktiv-simple.html"
$remoteFile = "/pages/interaktiv.html"

Write-Host "Uploading file..." -ForegroundColor Cyan

try {
    $request = [System.Net.FtpWebRequest]::Create("$ftpServer$remoteFile")
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $request.UsePassive = $true
    $request.UseBinary = $true
    
    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $request.ContentLength = $fileContent.Length
    
    $requestStream = $request.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    Write-Host "SUCCESS: File uploaded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open: http://school-board.online/pages/interaktiv.html" -ForegroundColor Cyan
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
