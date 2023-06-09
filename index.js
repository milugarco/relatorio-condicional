const mysql = require('mysql');
const PDFDocument = require('pdfkit');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path')

operation();

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Gerar relatorio condicional',
            'Sair'
        ]
    }]).then((answer) => {
        const action = answer['action']

        if (action === 'Gerar relatorio condicional') {
            selecionaCliente()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Até logo!'))
            process.exit()
        }
    }).catch((err) => console.log(err))
}

function selecionaCliente() {
    inquirer.prompt([{
        name: 'codigoCliente',
        message: 'Digite o código do cliente'
    }
    ]).then((answer) => {
        const codigoCliente = answer['codigoCliente']
        if (codigoCliente == 0) {
            geraRelatorioSemCliente()
        } else {
            geraRelatorio(codigoCliente)
        }
    })
};

function geraRelatorioSemCliente() {
    const connection = mysql.createConnection({
        host: "127.0.0.1",
        port: 3309,
        user: "root",
        password: "dominus2011",
        database: "excellent",
        insecureAuth: true,
        multipleStatements: true,
    });

    connection.connect((err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }
        console.log(chalk.green('Conexão bem-sucedida ao banco de dados!'));
    });


    connection.query(`SELECT c.Nome_Fantasia, p.Descricao from cond_itens_levado_pelo_cli con 
                      Inner join cad_Cliente_Fornecedor c on con.id_Cli = c.Id
                      inner join cad_produtos p on con.Id_Prod = p.Id`, (err, rows) => {
        if (err) {
            console.error('Erro ao resgatar dados da tabela:', err);
            return;
        }

        const relatorioPath = path.join(__dirname, 'relatorios');

        if (!fs.existsSync(relatorioPath)) {
            fs.mkdirSync(relatorioPath);
        }

        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(path.join(relatorioPath, 'todos-clientes.pdf')));

        doc.fontSize(14).text('Resultado:', { underline: true });

        rows.forEach((row) => {
            doc.fontSize(12).text(`Cliente: ${row.Nome_Fantasia}`);
            doc.fontSize(12).text(`Produto: ${row.Descricao}`);
            doc.fontSize(12).text('------------------------------------------------------------');
        });

        doc.end();
        console.log(chalk.green('Relátorio de todos os clientes...'))
        console.log('PDF criado com sucesso!');
        operation()
    });
};

function geraRelatorio(codigoCliente) {
    const connection = mysql.createConnection({
        host: "127.0.0.1",
        port: 3309,
        user: "root",
        password: "dominus2011",
        database: "excellent",
        insecureAuth: true,
        multipleStatements: true,
    });

    connection.connect((err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            return;
        }
        console.log(chalk.green('Conexão bem-sucedida ao banco de dados!'));
    });


    connection.query(`SELECT c.Nome_Fantasia, p.Descricao from cond_itens_levado_pelo_cli con 
                      Inner join cad_Cliente_Fornecedor c on con.id_Cli = c.Id
                      inner join cad_produtos p on con.Id_Prod = p.Id where c.Id = ${codigoCliente}`,
        (err, rows) => {
            if (err) {
                console.error('Erro ao resgatar dados da tabela:', err);
                return;
            }

            const relatorioPath = path.join(__dirname, 'relatorios');

            if (!fs.existsSync(relatorioPath)) {
                fs.mkdirSync(relatorioPath);
            }

            const doc = new PDFDocument();

            doc.pipe(fs.createWriteStream(path.join(relatorioPath, `cliente-${codigoCliente}.pdf`)));
            doc.fontSize(14).text('Resultado:', { underline: true });

            rows.forEach((row) => {
                doc.fontSize(12).text(`Cliente: ${row.Nome_Fantasia}`);
                doc.fontSize(12).text(`Produto: ${row.Descricao}`);
                doc.fontSize(12).text('------------------------------------------------------------');
            });

            doc.end();

            console.log(chalk.green('Relátorio de cliente especifico...'))
            console.log('PDF criado com sucesso!');
            operation()
        });
};





