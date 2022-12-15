// modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

// modulos internos
import fs from 'fs';

function operation() {
    const prompt = inquirer.createPromptModule();
    prompt({
        type: 'list',
        name: 'action',
        message: 'O que voce deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    })
    .then((answer) => {
        switch (answer.action) {
            case 'Criar Conta':
                createAccount();
                break;
            case 'Consultar Saldo':
                showBalance();
                break;
            case 'Depositar':
                deposit();
                break;
            case 'Sacar':
                withdraw();
                break;
            case 'Sair':
                exitAccounts();
                break;
        }
    })
    .catch(error => console.log(error));
}

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'));
    console.log(chalk.green('Defina as opções da sua conta'));
    buildAccount();
}

function buildAccount() {
    const prompt = inquirer.createPromptModule();
    prompt({
        name: 'accountName',
        message: 'Digite um nome para a sua conta'
    })
    .then(answer => {
        const accountName = answer.accountName;
        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Ops.. Essa conta já existe'));
            return buildAccount()
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}');
        console.log(chalk.green("Parabéns a sua conta foi criada com sucesso!"));
        operation();
    })
    .catch(error => console.log(error));
}

function exitAccounts() {
    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts'));
    process.exit();
}

function deposit() {
    const prompt = inquirer.createPromptModule();
    prompt({
        name: 'accountName',
        message: 'Digite o nome da conta que deseja efetuar o Deposito'
    })
    .then(answer => {
        const accountName = answer.accountName;
        if (!fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Conta inexistente'));
            return operation();
        }

        prompt({
            name: 'value',
            message: 'Qual o valor do deposito? '
        })
        .then(answer => {
            if (!parseFloat(answer.value)) {
                console.log(chalk.bgRed.black('Por favor digite um valor válido'));
                return deposit();
            }

            let account = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf-8', flag: 'r'});
            account = JSON.parse(account);
            account = setAmount(account, answer.value);
            fs.writeFileSync(`accounts/${accountName}.json`, account);
            return operation();
        })
    })
    .catch(error => console.log(error));
}

function showBalance() {
    const prompt = inquirer.createPromptModule();
    prompt({
        name: 'accountName',
        message: 'Digite o nome da conta que deseja consultar o Saldo'
    })
    .then(answer => {
        const accountName = answer.accountName;
        if (!fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Conta inexistente'));
            return operation();
        }

        let account = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf-8', flag: 'r' });
        account = JSON.parse(account);
        console.log(chalk.bgBlue.black(`Seu saldo é de R$ ${account.balance}`));
        return operation();
    })
    .catch(error => console.log(error));
}

function withdraw() {
    const prompt = inquirer.createPromptModule();
    prompt({
        name: 'accountName',
        message: 'Digite o nome da conta que deseja efetuar o Saque'
    })
    .then(answer => {
        const accountName = answer.accountName;
        if (!fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Conta inexistente'));
            return operation();
        }

        prompt({
            name: 'value',
            message: 'Qual o valor do Saque? '
        })
        .then(answer => {
            if (!parseFloat(answer.value)) {
                console.log(chalk.bgRed.black('Por favor digite um valor válido'));
                return deposit();
            }

            let account = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf-8', flag: 'r'});
            account = JSON.parse(account);
            if (parseFloat(answer.value) > account.balance) {
                console.log(chalk.bgRed.black('Saldo insuficiente'));
                return withdraw();
            }
            account = setAmount(account, answer.value, 'Saque');
            fs.writeFileSync(`accounts/${accountName}.json`, account);
            return operation();
        })
    })
    .catch(error => console.log(error));
}

function setAmount(account, value, operation = 'Deposito') {
    if (operation === 'Deposito') {
        account.balance += parseFloat(value);
    } else {
        account.balance -= parseFloat(value);
    }
    console.log(chalk.green(`${operation} de R$ ${parseFloat(value)} efetuado com sucesso!`));
    return JSON.stringify(account);
}

operation();