var passport         = require('passport');
var LocalStrategy    = require('passport-local').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var mongoose         = require("mongoose");

module.exports = function(app) {

    var userModel = require("../../models/user/user.model.server.js")();

    var auth = authorized;
    app.post  ('/api/login', passport.authenticate('local'), login);
    app.post  ('/api/logout',         logout);
    app.post  ('/api/register',       register);
    app.post  ('/api/user',     auth, createUser);
    app.get   ('/api/loggedin',       loggedin);
    app.get   ('/api/user',     auth, findAllUsers);
    app.put   ('/api/user/:id', auth, updateUser);
    app.delete('/api/user/:id', auth, deleteUser);

    app.get   ('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/#/profile',
            failureRedirect: '/#/login'
        }));

    app.get   ('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get   ('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/#/profile',
            failureRedirect: '/#/login'
        }));

    app.get   ('/auth/twitter', passport.authenticate('twitter', { scope :'email' }));
    app.get   ('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/#/profile',
            failureRedirect: '/#/login'
        }));

    app.get   ('/auth/instagram', passport.authenticate('instagram'));   //, { scope :'email' }
    app.get   ('/auth/instagram/callback',
        passport.authenticate('instagram', {
            successRedirect: '/#/profile',
            failureRedirect: '/#/login'
        }));

    var googleConfig = {
        clientID        : '140267600634-n9rgmgdn0kfnbbr74m1o0pl920kvbgjn.apps.googleusercontent.com',   //process.env.GOOGLE_CLIENT_ID,
        clientSecret    : 'CPYM0FkQbGVd-R_SgRxwOfn0',   //process.env.GOOGLE_CLIENT_SECRET,
        callbackURL     : 'http://localhost:8080/auth/google/callback'   //process.env.GOOGLE_CALLBACK_URL
    };

    var facebookConfig = {
        clientID        : '285740551842687', //process.env.FACEBOOK_CLIENT_ID,
        clientSecret    : '1f8986f938d021c0dbcb1036407b1ede',  //process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL     : 'http://localhost:8080/auth/facebook/callback'   //process.env.FACEBOOK_CALLBACK_URL
    };

    var twitterConfig = {
        consumerKey        : '8izSXliqhGVY24mFbypcowxot',   //process.env.TWITTER_CLIENT_ID,
        consumerSecret    : '8OCCmMS2leVH16UVgDrx5msrZxbzhf2ZcALiRUwUEouR4kdDiV',   //process.env.TWITTER_CLIENT_SECRET,
        access_token_secret : 'gKdql86VhYRMMgGOmbmETFkL9bXEyNGgFEyeRSe27r5XQ',
        callbackURL     : 'http://localhost:8080/auth/twitter/callback'   //process.env.TWITTER_CALLBACK_URL
    };

    var instagramConfig = {
        clientID        : 'e9ff0a5c37ac4fe5b243bcc540551376', //process.env.INSTAGRAM_CLIENT_ID,
        clientSecret    : '81c4eb979cac4877b5ad18d7228261f3',  //process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL     : 'http://localhost:8080/auth/instagram/callback'   //process.env.INSTAGRAM_CALLBACK_URL
    };

    passport.use(new FacebookStrategy(facebookConfig, facebookStrategy));
    passport.use(new GoogleStrategy(googleConfig, googleStrategy));
    passport.use(new TwitterStrategy(twitterConfig, twitterStrategy));
    passport.use(new InstagramStrategy(instagramConfig, instagramStrategy));
    passport.use(new LocalStrategy(localStrategy));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    function facebookStrategy(token, refreshToken, profile, done) {
        userModel
            .findUserByFacebookId(profile.id)
            .then(
                function(user) {
                    if(user) {
                        return done(null, user);
                    } else {
                        console.log('\n\n FB profile~~~~~~~~',profile);
                        var names = profile.displayName.split(" ");
                        var newFacebookUser = {
                            lastName:  names[1],
                            firstName: names[0],
                            email:     profile.emails ? profile.emails[0].value:"",
                            facebook: {
                                id:    profile.id,
                                token: token
                            }
                        };
                        return userModel.createUser(newFacebookUser);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            )
            .then(
                function(user){
                    return done(null, user);
                },
                function(err){
                    if (err) { return done(err); }
                }
            );
    }

    function googleStrategy(token, refreshToken, profile, done) {
        userModel
            .findUserByGoogleId(profile.id)
            .then(
                function(user) {
                    if(user) {
                        return done(null, user);
                    } else {
                        console.log('\n\n Google profile~~~~~~~~',profile);
                        var newGoogleUser = {
                            lastName: profile.name.familyName,
                            firstName: profile.name.givenName,
                            email: profile.emails[0].value,
                            google: {
                                id:          profile.id,
                                token:       token
                            }
                        };
                        return userModel.createUser(newGoogleUser);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            )
            .then(
                function(user){
                    return done(null, user);
                },
                function(err){
                    if (err) { return done(err); }
                }
            );
    }

    function twitterStrategy(token, refreshToken, profile, done) {
        userModel
            .findUserByTwitterId(profile.id)
            .then(
                function(user) {
                    if(user) {
                        return done(null, user);
                    } else {
                        console.log('\n\n Twitter profile~~~~~~~~',profile);
                        var newTwitterUser = {
                            lastName: profile.displayName.slice(profile.displayName.lastIndexOf(' ')+1),
                            firstName: profile.displayName.slice(0, profile.displayName.indexOf(' ')),
                            twitter: {
                                id:          profile.id,
                                token:       token
                            }
                        };
                        return userModel.createUser(newTwitterUser);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            )
            .then(
                function(user){
                    return done(null, user);
                },
                function(err){
                    if (err) { return done(err); }
                }
            );
    }

    function instagramStrategy(token, refreshToken, profile, done) {
        userModel
            .findUserByInstagramId(profile.id)
            .then(
                function(user) {
                    if(user) {
                        return done(null, user);
                    } else {
                        console.log('\n\n Instagram profile~~~~~~~~',profile);
                        // var names = profile.displayName.split(" ");
                        var newInstagramUser = {
                            lastName: profile.displayName.slice(profile.displayName.lastIndexOf(' ')+1),
                            firstName: profile.displayName.slice(0, profile.displayName.indexOf(' ')),
                            // email:     profile.emails ? profile.emails[0].value:"",
                            instagram: {
                                id:    profile.id,
                                token: token
                            }
                        };
                        return userModel.createUser(newInstagramUser);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            )
            .then(
                function(user){
                    return done(null, user);
                },
                function(err){
                    if (err) { return done(err); }
                }
            );
    }

    function localStrategy(username, password, done) {
        userModel
            .findUserByCredentials({username: username, password: password})
            .then(
                function(user) {
                    if (!user) { return done(null, false); }
                    return done(null, user);
                },
                function(err) {
                    if (err) { return done(err); }
                }
            );
    }

    function serializeUser(user, done) {
        done(null, user);
    }

    function deserializeUser(user, done) {
        userModel
            .findUserById(user._id)
            .then(
                function(user){
                    done(null, user);
                },
                function(err){
                    done(err, null);
                }
            );
    }

    function login(req, res) {
        var user = req.user;
        res.json(user);
    }

    function loggedin(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    }

    function logout(req, res) {
        req.logOut();
        res.sendStatus(200);
    }

    function register(req, res) {
        var newUser = req.body;
        newUser.roles = ['student'];

        userModel
            .findUserByUsername(newUser.username)
            .then(
                function(user){
                    if(user) {
                        res.json(null);
                    } else {
                        return userModel.createUser(newUser);
                    }
                },
                function(err){
                    res.status(400).send(err);
                }
            )
            .then(
                function(user){
                    if(user){
                        req.login(user, function(err) {
                            if(err) {
                                res.status(400).send(err);
                            } else {
                                res.json(user);
                            }
                        });
                    }
                },
                function(err){
                    res.status(400).send(err);
                }
            );
    }

    function findAllUsers(req, res) {
        if(isAdmin(req.user)) {
            userModel
                .findAllUsers()
                .then(
                    function (users) {
                        res.json(users);
                    },
                    function () {
                        res.status(400).send(err);
                    }
                );
        } else {
            res.status(403);
        }
    }

    function deleteUser(req, res) {
        if(isAdmin(req.user)) {

            userModel
                .removeUser(req.params.id)
                .then(
                    function(user){
                        return userModel.findAllUsers();
                    },
                    function(err){
                        res.status(400).send(err);
                    }
                )
                .then(
                    function(users){
                        res.json(users);
                    },
                    function(err){
                        res.status(400).send(err);
                    }
                );
        } else {
            res.status(403);
        }
    }

    function updateUser(req, res) {
        var newUser = req.body;
        if(!isAdmin(req.user)) {
            delete newUser.roles;
        }
        if(typeof newUser.roles == "string") {
            newUser.roles = newUser.roles.split(",");
        }

        userModel
            .updateUser(req.params.id, newUser)
            .then(
                function(user){
                    return userModel.findAllUsers();
                },
                function(err){
                    res.status(400).send(err);
                }
            )
            .then(
                function(users){
                    res.json(users);
                },
                function(err){
                    res.status(400).send(err);
                }
            );
    }

    function createUser(req, res) {
        var newUser = req.body;
        if(newUser.roles && newUser.roles.length > 1) {
            newUser.roles = newUser.roles.split(",");
        } else {
            newUser.roles = ["student"];
        }

        // first check if a user already exists with the username
        userModel
            .findUserByUsername(newUser.username)
            .then(
                function(user){
                    // if the user does not already exist
                    if(user == null) {
                        // create a new user
                        return userModel.createUser(newUser)
                            .then(
                                // fetch all the users
                                function(){
                                    return userModel.findAllUsers();
                                },
                                function(err){
                                    res.status(400).send(err);
                                }
                            );
                    // if the user already exists, then just fetch all the users
                    } else {
                        return userModel.findAllUsers();
                    }
                },
                function(err){
                    res.status(400).send(err);
                }
            )
            .then(
                function(users){
                    res.json(users);
                },
                function(){
                    res.status(400).send(err);
                }
            )
    }

    function isAdmin(user) {
        if(user.roles.indexOf("admin") > 0) {
            return true
        }
        return false;
    }

    function authorized (req, res, next) {
        if (!req.isAuthenticated()) {
            res.send(401);
        } else {
            next();
        }
    };
}