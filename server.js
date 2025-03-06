const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/register", async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    fs.readFile(path.join(__dirname, "users.json"), "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const users = data ? JSON.parse(data) : [];

        const new_user = {
            id: userId,
            name,
            password: hashPassword,
        };

        users.push(new_user);
        fs.writeFile(path.join(__dirname, "users.json"), JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to write JSON file" });
            }

            res.status(200).json({ message: "Registration succeeded", id: userId });
        });
    });
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    fs.readFile(path.join(__dirname, "users.json"), "utf8", async (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ error: "Failed to read JSON file" });
        }

        const users = data ? JSON.parse(data) : [];
        const user = users.find((u) => u.name === name);

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login succeeded", id: user.id });
    });
});

app.get("/log", (req, res) => {
    res.sendFile(path.join(__dirname, "public","log", "log.html"))
})

app.get("/", (req, res) => {
    res.redirect("/log");
})

app.get("/game", (req,res) => {
    res.sendFile(path.join(__dirname, "public", "game", "game.html"))
})

app.get("/game_info", (req, res) => {
    fs.readFile(path.join(__dirname, "game_data.json"), "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read game data" });
        }
        res.status(200).json(JSON.parse(data));
    })
})

app.get("/user_info/:id", (req,res) => {
    const userId = req.params.id;

    
    fs.readFile(path.join(__dirname, "user_results.json"), "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ error: "Failed to read user results" });
        }

        const userResults = data ? JSON.parse(data) : {};

        if (userResults[userId]) {
            res.status(200).json(userResults[userId]);
        } else {
            const newGameData = {
                player: { x: 50, y: 90, coins: 0, speed: 0.5, vision: 5},
                userId: userId
            };

            userResults[userId] = newGameData;
            fs.writeFile(path.join(__dirname, "user_results.json"), JSON.stringify(userResults, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to save game data" });
                }
                res.status(200).json(newGameData);
            });
        }
    });
})

app.put("/save_game/:id", (req, res) => {
    const userId = req.params.id;
    const {player} = req.body;

    fs.readFile(path.join(__dirname, "user_results.json"), "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ error: "Failed to read user results" });
        }

        const userResults = data ? JSON.parse(data) : {};

        userResults[userId] = {
            player
        };

        fs.writeFile(path.join(__dirname, "user_results.json"), JSON.stringify(userResults, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to save game data" });
            }
            res.status(200).json({ message: "Game saved successfully" });
        });
    });
})

app.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
});
