# Быстрая загрузка index.html на хостинг

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

Write-Host "Загрузка index.html..." -ForegroundColor Cyan

try {
    # Загружаем главный index.html
    $request = [System.Net.FtpWebRequest]::Create("$ftpServer/index.html")
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $request.UsePassive = $true
    $request.UseBinary = $true
    
    $fileContent = [System.IO.File]::ReadAllBytes("d:\web ita-sochi\index.html")
    $request.ContentLength = $fileContent.Length
    
    $requestStream = $request.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    Write-Host "OK: index.html загружен в корень сайта" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Проверьте: http://school-board.online/" -ForegroundColor Cyan
Write-Host ""
Read-Host "Нажмите Enter"
