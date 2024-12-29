# Taiko Transaction Bot

Bu Taiko da günlük olarak hacim botudur, rutin bir bottur, görevi 50 tane wrap ve 50 tane unwrap işlemi yapar ve bu işlemleri 5 saatlik rastgele bir zamanda yapar.


## Set Up

### Step-by-Step Instructions

1. **Update the package lists:**

    ```sh
    sudo timedatectl set-timezone UTC
     ```
     ```sh
    sudo nano /etc/default/locale
    ```
     Çıkan ekrana aşağıda kodu yapıştırın  ctrl+O Enter sonrasında Ctrl+X
   
    ```sh
    LC_TIME="en_GB.UTF-8"
    ```
    ```sh
    source /etc/default/locale
    ```
    ```sh
    sudo reboot
    ```
    ```sh
    sudo apt-get update
    ```

3. **Install git:**

    ```sh
    sudo apt-get install git
    ```

4. **Clone the repository:**

    ```sh
    git clone https://github.com/TastasMete/TaikoBot.git
    ```

5. **Navigate to the project directory:**

    ```sh
    cd TaikoBot
    ```

6. **Install Node.js (if not already installed):**

    ```sh
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    ```
    ```sh    
   sudo apt-get install -y nodejs
    ```

7. **Install the project dependencies:**

    ```sh
    npm install
    ```

8. **Create a `.env` file in the project directory and add your address & private key:**

    
    ```sh
    echo "PRIVATE_KEY=your_private_key_here" > .env
    ```

## Running the Bot

### One-time Run

To run the bot once:

```sh
npm run start
```
### Scheduled Run

Rastgele bir saat ve dakika oluşturma (08:00 ile 11:59 arasında çalışacak):

1.	Make the setup-cron.sh script executable:
 ```sh
sudo apt-get update
```
```sh
sudo apt-get install cron
```
```sh
sudo service cron start
```
```sh
sudo systemctl enable cron
```
```sh
chmod +x setup-cron.sh
```
2.	Run the setup-cron.sh script:
```sh
./setup-cron.sh
```
```sh
cat cron.log
```

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

## SUPPORT
Each tx contain tiny amount of tax to support next Bot with various features


