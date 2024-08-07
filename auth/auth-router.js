const bcryptjs = require('bcryptjs');
const router = require("express").Router()

const Users = require("../api/users/users-model.js")



router.post('/register', (req, res) => {
    let creds = req.body;
    const rounds = process.env.HASH_ROUNDS || 4;

    const hash = bcryptjs.hashSync(creds.password, rounds);

    creds.password = hash;

    Users.add(creds)
        .then(saved => {
            res.status(201).json({ data: saved });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

router.post('/login', (req, res) => {

    const { username, password } = req.body;

    Users.findBy({ username })
        .then(users => {
            const user = users[0];

            if (user && bcryptjs.compareSync(password, user.password)) {
                // store the session in the database
                // produce a cookie
                // send back the cookie with the session id to the client
                req.session.loggedIn = true;
                req.session.username = user.username;

                res.status(200).json({ Message: "Welcome!", session: req.session });
            } else {
                res.status(401).json({ Message: "invalid credentials" })
            }
        })

        // const creds = req.body;
        // const rounds = process.env.HASH_ROUNDS || 4;

        // const hash = bcryptjs.hashSync(creds.password, rounds);

        // creds.password = hash;

        // Users.add(creds).then(saved => {
        //     res.status(201).json({ data: saved });
        // })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});


router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ Message: "error logging out, please try again later" })
            } else {
                res.status(204).end()
            }
        });

    } else {
        res.status(200).json({ Message: "already logged out" })
    }

});




module.exports = router;