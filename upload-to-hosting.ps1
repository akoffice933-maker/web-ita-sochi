# Скрипт для загрузки сайта на хостинг через FTP
# Запустите этот скрипт в PowerShell

# ==================== НАСТРОЙКИ ====================

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"  # Ваш пароль

$localPath = "d:\web ita-sochi"
$remotePath = "/"

# ==================== ФУНКЦИИ ====================

function Upload-File {
    param (
        [string]$localFile,
        [string]$remoteFile
    )
    
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
    }
    catch {
        Write-Host "ERROR: $remoteFile - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== ЗАГРУЗКА ====================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ЗАГРУЗКА САЙТА НА ХОСТИНГ" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Сервер: $ftpServer"
Write-Host "Пользователь: $ftpUsername"
Write-Host "Папка: $localPath"
Write-Host ""

# Проверка подключения
Write-Host "Проверка подключения..." -ForegroundColor Yellow
try {
    $testRequest = [System.Net.FtpWebRequest]::Create($ftpServer)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $testResponse = $testRequest.GetResponse()
    Write-Host "OK: Подключение успешно!" -ForegroundColor Green
    $testResponse.Close()
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Проверьте логин, пароль и интернет" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit
}

Write-Host ""
Write-Host "НАЧАЛО ЗАГРУЗКИ..." -ForegroundColor Cyan
Write-Host ""

# Загрузка основных файлов
Write-Host "Загрузка файлов..." -ForegroundColor Yellow
$files = @(
    "index.html",
    ".htaccess",
    "favicon.svg",
    "robots.txt",
    "sitemap.xml",
    "submit.php",
    "privacy-policy.html"
)

foreach ($file in $files) {
    $localFile = Join-Path $localPath $file
    if (Test-Path $localFile) {
        Upload-File -localFile $localFile -remoteFile "$remotePath$file"
    }
}

# Загрузка папок
Write-Host ""
Write-Host "Загрузка папок..." -ForegroundColor Yellow

$folders = @("css", "js", "images", "pages", "calculator", "videos", "logs")

foreach ($folder in $folders) {
    $localFolder = Join-Path $localPath $folder
    if (Test-Path $localFolder) {
        Write-Host "Папка: $folder/" -ForegroundColor Cyan
        Get-ChildItem -Path $localFolder -File -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Replace($localPath, "").Replace("\", "/")
            Upload-File -localFile $_.FullName -remoteFile "$remotePath$relativePath"
        }
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "ЗАГРУЗКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте сайт:" -ForegroundColor Cyan
Write-Host "https://school-board.online/" -ForegroundColor White
Write-Host "https://school-board.online/calculator/" -ForegroundColor White
Write-Host ""
Write-Host "Если есть ошибки - проверьте логи выше" -ForegroundColor Yellow
Write-Host ""

Read-Host "Нажмите Enter для выхода"
