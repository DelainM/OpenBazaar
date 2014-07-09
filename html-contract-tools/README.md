# HTML contract tools

The goal of the **HTML contract tools** is to create a multi platform, offline interface to build, read and manage OpenBazaar contracts.  This tool is in Alpha testing at the moment, So please be a little patient with it.  If you notice any issues, let us know.

Kudos to the guys at http://openpgpjs.org/ for the javascript to manage the PGP keys, etc.


## Usage
Download the entire contents of this directory, and run the index.html file.  This should open in your preferred browser, though it is recommended you run this in chrome or firefox due to compatibility issues with the OpenPGPJS javascript.

By default you will be asked for a PGP Private key to store locally.  Please note (as per warning on screen) this key is stored un-encrypted in your local storage, so if a hacker was to gain access to your HTML5 storage, your PGP private key could be compromised. 

Anytime you are working on a contract (either in raw form or template form), it is always saved to the "Current" contract.  You can save this contract and retrieve it later from the Options menu, or clear it to begin a fresh contract.

The current contract is persistant through browser restarts and refreshes, meaning the only way to start a new contract is to double click the "Clear Contract" button in the raw contract editor, or load another contract from the options menu.


##Screenshots

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools.png?raw=true)

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools_raw.png?raw=true)

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools_save_contract.png?raw=true)

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools_sign.png?raw=true)

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools_signed_contract.png?raw=true)

![](https://github.com/DelainM/OpenBazaar/blob/html-contracts/html-contract-tools/resources/OB-HTML-Contract-tools_contract_options.png?raw=true)


## Some of the workings.

As the definition of what a contract in OpenBazaar should contain is still fairly fluid, this interface has been and is being built to be able to adapt to future needs of contracts.  With this in mind, we plan to create many small functions in javascript to run the application, so that as the scope of openBazaar contracts change, the application can adapt relativly easily.

All fields in contracts are specified in a javascript array, with options for minimum length, maximum length, and regular expression validation to confirm the values a user inputs is valid data for the particular field.  For example, in the BTC address field, the regular expression *^[13][a-zA-Z0-9]{26,33}$* forces the user to enter a valid Bitcoin Address.
