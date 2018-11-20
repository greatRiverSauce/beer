const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
    host     : 'db336.chz97zipugcc.us-east-2.rds.amazonaws.com',
    user     : 'jackielj',
    password : 'Liu941219',
    database : 'BarBeerDrinkerPlus'
});

// Put all API endpoints under '/api'
// Put all API endpoints under '/api'
/**
 * Get all the data
 * **/
app.get('/data/:sql', (req, res) => {
    const sql = req.params.sql;
connection.query(sql, function (error, results, fields) {
    if (error) {
        res.send({"msg": "Invalid SQL"})
    }
    else res.send(results);
});
});

/**
 * Given a drinker, show all his/her transactions ordered by time and grouped by different bars.
 * **/
app.get('/drinkers/:drinkerName/:month/transactions', (req, res) => {
    const drinkerName = req.params.drinkerName;
const month = req.params.month;
const sql = `Select t.bar, count(t.bar) as amount from transactions t where t.buyer = '${drinkerName}' and t.month = '${month}' group by t.bar order by amount desc`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Show bar graphs of beers s/he orders the most.
 * **/
app.get('/drinkers/:drinkerName/beers', (req, res) => {
    const drinkerName = req.params.drinkerName;
const sql = `select b.item, t.buyer, SUM(b.quantity) as amount from buys b, transactions t, beers be where t.buyer = '${drinkerName}' and  b.item = be.name and t.ID = b.transID group by b.item order by amount desc`
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * his/her spending in different bars, on different dates/weeks/months
 * **/

app.get('/drinkers/:drinkerName/:month/spending', (req, res) => {
    const drinkerName = req.params.drinkerName;
const month = req.params.month;
const sql = `select t.ID, t.bar, t.buyer, SUM(t.total) as amount from transactions t where t.buyer = '${drinkerName}'  and t.month = '${month}' group by t.bar order by amount desc`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Given a bar, show bar graphs for top10 drinkers who are largest spenders,
 * **/

app.get('/bar/:barName/drinkers', (req, res) => {
    const barName = req.params.barName;
const sql = `select t.buyer, SUM(total) as Total from transactions t where t.bar = '${barName}' group by buyer order by Total DESC limit 10;`
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Rank top 10 beer brands  which are most popular in the specified bar on a specified day of the week or weekend.
 * **/
app.get('/bar/:barName/beer/:day', (req, res) => {
    const barName = req.params.barName;
const day = req.params.day;
const sql = `select be.name , SUM(b.quantity) AS Sales from transactions t, buys b, beers be where t.day = '${day}' and b.item = be.name  and t.ID = b.transID and t.bar = '${barName}' group by be.name order by Sales DESC limit 10`
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Demonstrate time distribution of sales, show what are the busiest periods of the day and of the week for each bar.
 * **/

/**
 * Show fraction of bar inventory which is being sold on each day of the week (bargraph).
 * **/

/**
 * Bar Analytics:  Rank top 10 bars by sales of each brand of a beer and total sales for each day of the week.
 * Make boxes with drop down menus which allow to specify brand of a beer and day of the week
 * and execute a query ranking bars by their sales of specified beer and specified day.
 * **/
app.get('/bar/:beerName/:day', (req, res) => {
    const beerName = req.params.beerName;
const day = req.params.day;
const sql = `select t.bar, SUM(b.quantity) AS Sales from transactions t, buys b, beers be where t.day = '${day}' and b.item = be.name  and t.ID = b.transID and b.item = '${beerName}' group by t.bar order by Sales DESC limit 10`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Given a beer – show bars where this beer sells the most
 * **/
app.get('/beer/:beerName/bars', (req, res) => {
    const beerName = req.params.beerName;
const sql = `select t.bar, SUM(quantity) as amount from transactions t, buys b where t.ID = b.transID and b.item = '${beerName}' GROUP BY t.bar ORDER BY amount desc LIMIT 10;`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * show also drinkers who are the biggest consumers of this beer
 * **/
app.get('/beer/:beerName/drinkers', (req, res) => {
    const beerName = req.params.beerName;
const sql = `select t.buyer,SUM(quantity)as amount from transactions t, buys b where t.ID = b.transID and b.item = '${beerName}' GROUP BY t.buyer ORDER BY quantity DESC `;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * distribution of when this beer sells the most
 * **/
app.get('/beer/:beerName/times', (req, res) => {
    const beerName = req.params.beerName;
const sql = `select t.month, SUM(quantity) as amount from transactions t, buys b where t.ID = b.transID and b.item = '${beerName}' GROUP BY t.month order by amount DESC`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Given a bartender (drop down menu) for a given bar (drop down menu),
 * show all shifts of this bartender in the past and how many beers of each brand did he sell.
 * **/
app.get('/bar/:barName/:bartenderName/shifts/beer', (req, res) => {
    const bartenderName = req.params.bartenderName;
const barName = req.params.barName;
const sql = `select * from works w where w.bartender = '${bartenderName}' and w.bar = '${barName}'`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Given a bar, and a shift (say 8-10PM) and a day of the week, show ranking of bartenders by total number of beers sold.
 * This will compare “apples with apples”, since we will only compare bartenders on the same shift and same day of the week
 * (like Saturday for example, will definitely have higher rev).
 * **/

app.get('/bartender/ranking/:barName/:shiftName/:dayName', (req, res) => {
    const barName = req.params.barName;
const shiftName = req.params.shiftName;
const dayName = req.params.dayName;
const sql = `select t.bartender, SUM(b.quantity) as Sold from transactions t, buys b, works w, beers be where t.bar = '${barName}' and w.shift = '${shiftName}' and t.day = '${dayName}' and t.ID = b.transID and be.name = b.item GROUP BY t.bartender ORDER BY Sold DESC`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * Given manufacturer, show the regions (cities, states) where their sales are highest in last week.
 * **/
app.get('/manufacturer/:manufacturerName/regions/sale', (req, res) => {
    const manufacturerName = req.params.manufacturerName;
const sql = `select ba.location, SUM(b.quantity) as amount from transactions t, buys b, bars ba, beers be where t.ID = b.transID and b.item = be.name and be.manf = '${manufacturerName}' and t.bar = ba.name group by ba.location order by amount desc`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

/**
 * .  Show cities and states where their beers are liked the most
 * (i.e. where do the most of drinkers who like their beers live) in last week?
 * **/

app.get('/manufacturer/:manufacturerName/regions/likes', (req, res) => {
    const manufacturerName = req.params.manufacturerName;
const sql = `select d.hometown, COUNT(distinct d.name) as amount from likes l, drinkers d, beers be where l.beer = be.name and be.manf = '${manufacturerName}' group by d.hometown order by amount desc`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
});
});

app.get('/manufacturer/:manufacturerName', (req, res) => {
    console.log(req.params.manufacturerName);
const locations = [
    "Toledo-Ohio",
    "Tulsa-Oklahoma",
    "Arlington-Virginia",
    "Dallas-Texas",
    "Mesa-Arizona",
    "Nashville Davidson-Tennessee",
    "Hialeah-Florida",
    "Cleveland-Ohio"
];

res.send(locations);
});

app.get('/test', (req, res) => {
    connection.query('select * from drinkers d, frequents f where d.name = f.drinker limit 10', function (error, results, fields) {
    if (error) throw error;
    else res.send(results);
    //console.log(results);
    // connected!
});
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Password generator listening on ${port}`);
// /**
//  * Get all the data
//  * **/
// app.get('/data/:sql', (req, res) => {
//     const sql = req.params.sql;
//     connection.query(sql, function (error, results, fields) {
//         if (error) {
//             res.send({"msg": "Invalid SQL"})
//         }
//         else res.send(results);
//     });
// });