"use strict";

const router        = require('express').Router();
const fs            = require('fs');
const path          = require('path');
const cookie_auth   = require('../modules/auth_cookies');

function getDownloadFiles() {
    return new Promise( (resolve, reject) => {
        fs.readdir(path.join(__dirname, '..', 'public', 'images'), (err, files) => {

            resolve(files);
        });
    });
}

/* GET home page. */
router.get('/', cookie_auth.checkoAuth, (req, res) => {
    let link_auth = req.signedCookies.auth ? {
            url: '/user',
            title: 'profile'
        } : {
            url: '/login',
            title: 'Login'
        };

    res.render('index', {
        title: 'Express',
        form: false,
        links: [
            {
                url: '/download',
                title: 'Download'
            },
            link_auth
        ]
  });
});

/* GET download page */
router.get('/download', (req, res) => {

    getDownloadFiles().then(images => {
        res.render('download', {
            title: 'Download images',
            images: images
        });
    });

});

/* GET download zip */
router.get('/download/*', (req, res) => {
    let name  = req.params[0],
        r     = fs.createReadStream(path.join(__dirname,  '..', 'public', 'images', name)),
        z     = zlib.createGzip();
    r.pipe(z).pipe(res);

});


/* POST user auth */
router.post('/auth', cookie_auth.setAuth, (req, res, next) => {
    if (res.app.locals.admin) {
        res.redirect('/admin');
    } else {
        res.redirect('/user');
    }
});

/* GET users listing. */
router.get('/login', cookie_auth.checkoAuth, (req, res, next) => {
    res.render('index', {
        title: 'Login',
        links: [
            {
                url: '/',
                title: 'Home'
            },
        ],
        form: {
            action: '/auth',
            method: 'POST',
            inputs: [
                {
                    type: 'text',
                    title: 'login',
                    name: 'login',
                    placeholder: 'Login',
                    value: ''
                },
                {
                    type: 'password',
                    name: 'pass',
                    title: 'password',
                },
                {
                    type: 'submit',
                    title: 'Send'
                }
            ]
        }
    });
});

/* GET users listing. */
router.get('/user', (req, res, next) => {
    if (req.signedCookies.auth) {
        res.render('user', {
            title: `Page of ${req.signedCookies.auth}`,
            links: [
                {
                    url: '/',
                    title: 'Home'
                },
            ]
        });
    } else {
        res.redirect('/login');
    }
});

/* GET admin listing. */
router.get('/admin', (req, res, next) => {
    if (res.app.locals.admin) {
        res.render('admin', {
            title: req.signedCookies.auth,
            links: [
                {
                    url: '/',
                    title: 'Home'
                },
            ]
        });
    } else {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
});

module.exports = router;
