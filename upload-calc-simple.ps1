# Upload calculator to hosting

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

Write-Host "Uploading calculator..." -ForegroundColor Cyan

# Upload calculator/index.html
Upload-File "d:\web ita-sochi\calculator\index.html" "/calculator/index.html"

# Upload calculator/.htaccess
Upload-File "d:\web ita-sochi\calculator\.htaccess" "/calculator/.htaccess"

# Upload calculator/css/style.css
Upload-File "d:\web ita-sochi\calculator\css\calculator.css" "/calculator/css/calculator.css"

# Upload calculator/js/calculator.js
Upload-File "d:\web ita-sochi\calculator\js\calculator.js" "/calculator/js/calculator.js"

# Upload calculator/images
$images = Get-ChildItem "d:\web ita-sochi\calculator\images" -File
foreach ($img in $images) {
    Upload-File $img.FullName "/calculator/images/$($img.Name)"
}

Write-Host ""
Write-Host "Upload complete!" -ForegroundColor Green
Write-Host "Check: http://school-board.online/calculator/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
