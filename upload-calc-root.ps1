# Upload calculator to ROOT of hosting

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

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

Write-Host "Uploading calculator to ROOT..." -ForegroundColor Cyan

# Upload index.html
Upload-File "d:\web ita-sochi\calculator\index.html" "/index-calculator.html"

# Upload .htaccess
Upload-File "d:\web ita-sochi\calculator\.htaccess" "/calculator/.htaccess"

# Upload CSS
Upload-File "d:\web ita-sochi\calculator\css\calculator.css" "/calculator.css"

# Upload JS
Upload-File "d:\web ita-sochi\calculator\js\calculator.js" "/calculator.js"

Write-Host ""
Write-Host "Upload complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check: http://school-board.online/index-calculator.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
