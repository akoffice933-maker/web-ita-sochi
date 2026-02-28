#!/bin/bash
# Автоматическая установка SSL для school-board.online
# Запустите через SSH на хостинге

echo "=========================================="
echo "АВТОМАТИЧЕСКАЯ УСТАНОВКА SSL"
echo "для school-board.online"
echo "=========================================="
echo ""

# Проверка системы
if [ -f /etc/debian_version ]; then
    echo "Detected Debian/Ubuntu..."
    apt-get update
    apt-get install -y certbot python3-certbot-apache
elif [ -f /etc/redhat-release ]; then
    echo "Detected CentOS/RHEL..."
    yum install -y certbot python3-certbot-apache
else
    echo "Unknown system. Please install certbot manually."
    exit 1
fi

echo ""
echo "Getting Let's Encrypt certificate..."
echo ""

# Получение сертификата
certbot --apache \
  -d school-board.online \
  -d www.school-board.online \
  --non-interactive \
  --agree-tos \
  --email info@ita-sochi.ru

echo ""
echo "=========================================="
echo "✅ SSL УСТАНОВЛЕН!"
echo "=========================================="
echo ""
echo "Сайт доступен по HTTPS:"
echo "https://school-board.online/"
echo "https://school-board.online/calculator/"
echo "https://school-board.online/pages/interaktiv.html"
echo ""
echo "Сертификат обновляется автоматически!"
echo ""
