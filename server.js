const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ejs = require('ejs');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`)); // listen from server to implement socket.io
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));

app.post('/gen_card', async(req, res) => {
    console.log(`Calling POST for \'/gen_card\' with username ${req.body.userName}`);
    var userName = req.body.userName;
    try {
        const client = await pool.connect();
        var bingoRoundResult = await client.query(`SELECT * FROM bingo_round ORDER BY iteration DESC LIMIT 1`);
        bingoRoundResult = parseQueryResult(bingoRoundResult);
        var lastRound = bingoRoundResult[0].iteration;
        console.log(`Last bingo round: ${lastRound}`);
        var cellValueResults = await client.query(`SELECT cellvalue FROM cell_values WHERE active = true AND bingoround <= ${lastRound}`);
        cellValueResults = parseQueryResult(cellValueResults);

        var cellValues = pickCellValues(cellValueResults);
        if (cellValues == null) {
            res.send(`Error 1: We encountered an issue when generating your bingo card. Please find your nearest Nook scapegoat for public shaming`);
        }
        var isMarked = Array.from(new Array(5), x => Array.from(new Array(5), y => ""));
        isMarked[2][2] = "marked"; // pre-mark the FREE! cell

        var bingoCardResults = await client.query(`SELECT cardurl FROM bingo_cards WHERE bingoround = ${lastRound}`);
        bingoCardResults = parseQueryResult(bingoCardResults);
        var characters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;
        var cardUrl = ``;
        for (var attempt = 0; attempt < 5; attempt++) {
            for (var c = 0; c < 5; c++) { // make cardUrl 5 characters long
                cardUrl += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            var isUnique = true;
            for (card in bingoCardResults) {
                if (card.cardurl == cardUrl) {
                    cardUrl = ``;
                    isUnique = false;
                    break;
                }
            }
            if (isUnique) {
                break;
            }
        }

        if (cardUrl != `` && cardUrl != null) {
            console.log(`create bingo_card with url ${cardUrl} and username ${userName}`);
            await client.query(`INSERT INTO bingo_cards (bingoround, cardurl, cellvalues, marked, username) VALUES (${lastRound}, \'${cardUrl}\', \'${JSON.stringify(cellValues)}\', \'${JSON.stringify(isMarked)}\', \'${userName}\')`);
            client.release();
            res.send(`/bingocard=${cardUrl}`);
        } else {
            client.release();
            console.warn(`Couldnt generate a cardUrl: ` + cardUrl);
            res.send(`Error 2: We encountered an issue when generating your bingo card. Please try again. If this occurs again, please find your nearest Nook scapegoat for public shaming`);
        }
    } catch (err) {
        console.error(err);
        res.send(`Error 3: Please find your nearest Nook scapegoat for public shaming`);
    }
});

app.get('/bingocard=:cardUrl', async (req, res) => {
    console.log(`Calling GET for \'/bingocard\'=${req.params.cardUrl}`);
    var cardUrl = req.params.cardUrl;
    try {
        const client = await pool.connect();
        var bingoCardResults = await client.query(`SELECT * FROM bingo_cards WHERE cardurl = \'${cardUrl}\' ORDER BY id DESC`);
        var bingoCard = parseQueryResult(bingoCardResults);
        if (bingoCard == null) {
            res.send("No bingo card was found with this code");
        }
        var resBody = {
            username: bingoCard[0].username,
            cellvalues: JSON.parse(bingoCard[0].cellvalues),
            marked: JSON.parse(bingoCard[0].marked)
        }
        res.render(`pages/bingocard`, resBody);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error 3: Please find your nearest Nook scapegoat for public shaming`);
    }
});

app.get('/moderation', async(req, res) => {
    console.log(`Calling GET for \'/moderation\'`);
    if (req.query.password == null) {
        console.log(`User attempted to access moderation page without password`);
        res.render(`pages/moderation_pw`);
    } else if (req.query.password != `w8Q9mP2UGf6Q`) {
        console.warn(`User attempted to access moderation page with incorrect password ${req.query.password}`);
        res.status(403).send(`Password incorrect`);
    } else {
        try {
            const client = await pool.connect();
            var bingoRoundResult = await client.query(`SELECT * FROM bingo_round ORDER BY iteration DESC LIMIT 1`);
            bingoRoundResult = parseQueryResult(bingoRoundResult);
            var lastRound = bingoRoundResult[0].iteration;
            var cellValueResults = await client.query(`SELECT id, cellvalue, category, modmarked FROM cell_values WHERE active = true AND bingoround <= ${lastRound} ORDER BY id ASC`);
            cellValueResults = parseQueryResult(cellValueResults);

            var categories = [];
            for (var i = 0; i < cellValueResults.length; i++) {
                var cell = cellValueResults[i];
                var inCategories = false;
                for (var cat = 0; cat < categories.length; cat++) {
                    if (categories[cat].name == cell.category) {
                        inCategories = true;
                        categories[cat].cellValues.push({
                            cellValue: cell.cellvalue,
                            marked: cell.modmarked,
                            id: cell.id
                        });
                        break;
                    }
                }
                if (!inCategories) {
                    categories.push({
                        name: cell.category,
                        cellValues: [{
                            cellValue: cell.cellvalue,
                            marked: cell.modmarked,
                            id: cell.id
                        }]
                    })
                }
            }
            var resBody = {
                categories: categories
            }
            client.release();
            res.render(`pages/moderation`, resBody);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error 3: Please find your nearest Nook scapegoat for public shaming`);
        }
    }
});

function pickCellValues(allValues) {
    var pickedValues = Array.from(new Array(5), x => Array.from(new Array(5), y => ""));
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            if (allValues.length == 0) {
                console.log(`cell_values not long enough to make a full card`);
                return null;
            }
            if (row == 2 && col == 2) {
                pickedValues[row][col] = `FREE!`;
            } else {
                var pos = Math.floor(Math.random() * allValues.length);
                pickedValues[row][col] = allValues[pos].cellvalue;
                allValues.splice(pos, 1);
            }
        }
    }
    return pickedValues;
}

function parseQueryResult(queryResult) {
    if (Array.isArray(queryResult)) {
        let result = queryResult[0];
        for (let i = 1; i < queryResult.length; i++) {
            let tempResult = queryResult[i];
            result.rows.concat(tempResult.rows);
            result.rowCount += tempResult.rowCount;
        }
        queryResult = result;
    }
    console.log(`QUERY RESULTS: ` + JSON.stringify(queryResult.rows));
    return queryResult.rows;
}

io.on('connection', (socket) => {
    console.log(`User connected`);
    socket.on('disconnect', () => {
        console.log(`User disconnected`);
    });

    socket.on('save bingocard', (data) => {
        console.log(`toggling marked cell ${JSON.stringify(data)}`);
        pool.connect((err, client, done) => {
            if (err) throw err
            client.query(`UPDATE bingo_cards SET marked = \'${data.marked}\' WHERE cardurl = \'${data.cardUrl}\'`);
            client.release();
        });
    });

    socket.on('toggle mark', (data) => {
        console.log(`toggling marked cell ${JSON.stringify(data)}`);
        socket.broadcast.emit('toggle mark', data.id);
        pool.connect((err, client, done) => {
            if (err) throw err
            client.query(`UPDATE cell_values SET modmarked = \'${data.marked}\' WHERE id = \'${data.id}\'`);
            client.release();
        });
    });
});

/*app.get('/test', (req, res) => {
    var resBody = {
        cardurl: "aB1Ba",
        cellvalues: [],
        marked: Array.from(new Array(5), x => Array.from(new Array(5), y => "marked")),
        username: "Derpy McDerpface",
        isNew: false
    }
    var numbers = [1, 2, 3, 4, 5];
    for (var i = 0; i < 5; i++) {
        var row = [];
        for (var j = 0; j < 5; j++) {
            row.push(numbers[i] + "-" + numbers[j]);
        }
        resBody.cellvalues.push(row);
    }
    res.render('pages/bingocard', resBody);
});*/


/*INSERT INTO public.cell_values (cellvalue, category, bingoround, active) VALUES
('Digging a hole in the ground for the night', 'GENERIC_ACTION', 1, true)*/