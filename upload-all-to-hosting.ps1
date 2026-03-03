# Upload all files to school-board.online hosting
# Run in PowerShell

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "UPLOAD TO HOSTING" -ForegroundColor Cyan
Write-Host "school-board.online" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to upload file
function Upload-File {
    param ($localFile, $remoteFile)
    
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
        
        Write-Host "OK: $remoteFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: $remoteFile - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Uploading main files..." -ForegroundColor Yellow
Upload-File "d:\web ita-sochi\index.html" "/index.html"
Upload-File "d:\web ita-sochi\pages\interaktiv-new.html" "/pages/interaktiv.html"
Upload-File "d:\web ita-sochi\calculator\js\calculator-final.js" "/calculator/js/calculator.js"
Upload-File "d:\web ita-sochi\css\typography-cyber.css" "/css/typography-cyber.css"

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Check your site:" -ForegroundColor Cyan
Write-Host "http://school-board.online/" -ForegroundColor White
Write-Host "http://school-board.online/calculator/" -ForegroundColor White
Write-Host "http://school-board.online/pages/interaktiv.html" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to exit"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
