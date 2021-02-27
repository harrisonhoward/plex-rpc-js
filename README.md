# Discord Rich Presence for Plex
*This program runs on [NodeJS](https://nodejs.org/en/download/) (Install LTS)*\
This program is still in early development. If you have any bugs or cool features please leave them in ISSUES.\
Program has been only tested on Windows 10 devices. If any issues with Linux or OSX please contact me on Discord (Duck#9999).

### Examples

![Movie](https://i.imgur.com/RmoRUZP.png) ![TVShow](https://i.imgur.com/ZSOcxNu.png)

### Setup

You need to make sure that your config is setup. Navigate to `src/CONFIG.js`
```js
module.exports = {
    address: "", // Recommended to be the IP Address of the server
    username: "", // Recommended to be the Email address used (Use checkUsers for your actual Username)
    token: "", // Read below to find out how to get your token
    https: false, // If you don't know what this is, then leave it as false
    checkUsers: [""] // An array of usernames to check for (["Forbidden_Duck", "Duck"]) (this includes Managed Users)
};
```

### Start

There has been 2 provided start files `windows-start.bat` and `sh-start.sh`\
If you are unable to run either of these files follow these steps

1. Open terminal or command prompt
2. CD to the directory (i.e. `cd C:\Users\my-user\Desktop\plex-rpc-js`)
3. Run `npm install`
4. Then run `npm start`

### How do I get my token?

1. Go to https://app.plex.tv/desktop
![Step1](https://i.imgur.com/FR9azRC.png)
2. Open Inspect Element (F12 or CTRL + SHIFT + I)
![Step2](https://i.imgur.com/q1Gga8M.png)
3. Go to the Application application tab
![Step3](https://i.imgur.com/LeEx5kX.png)
4. Expand Local Storage and click "app.plex.tv"
![Step4](https://i.imgur.com/9hohc86.png)
5. Copy the key "myPlexAccessToken" \
**DO NOT SHARE THIS WITH ANYONE**\
**IT GIVES POTENTIAL ATTACKERS ACCESS TO YOUR ACCOUNT**\
*All our code is available for public eyes and does not maliciously use your token*
![Step5](https://i.imgur.com/UsAAgYR.png)
6. Paste this in the respective "token" value in `CONFIG.js`

### Why do I choose token over passwords?
I've tried using passwords with authenticators (you've probably seen, "enter the pin on screen at https://plex.tv/link"). This worked sometimes but not all the time. It was so unreliable I decided not to go with it.\
It's unreliablity was probably caused by the package used being discontinued.

More strategies are welcome if you can provided a way of doing it.