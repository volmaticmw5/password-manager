# Password Manager

This project is a free and open source password manager that you can (in the future) host yourself so you don't have to resort to a third party with your precious data.

Right now its pretty barebones and it only works locally. You can export and import passwords, add and edit passwords but that's about it.

## Features

- [x] AES-256 encryption
- [x] Password storage
- [x] Import & Export user data
- [ ] Secure notes
- [ ] Multilang support
- [ ] Syncing

## Building from source

This project is built using electron forge so you'll have to install node and npm in order to build it.

```cli
git clone https://github.com/volmaticmw5/password-manager.git
cd password-manager
npm update
npm run make
```
You can edit the package.json file in order to specify other platforms for forge to compile for.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Security Notice
This project is suitable for testing and educational purposes only.

The owner of this project is not responsible for any of your passwords and other stuff getting out there.

## License
[MIT](https://choosealicense.com/licenses/mit/)