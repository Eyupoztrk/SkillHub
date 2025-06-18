
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const config = require("../config");
const userModel = require("../database/Models/UserModel");



module.exports = function () {
    
    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
         
    },
        async (payload, done) => {
            console.log("🔐 Payload geldi mi?", payload);
            try {

                let user = await userModel.findOne({ _id: payload.id });
                console.log("user");

                if (user) {

                    done(null, {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        bio: user.bio,
                        skills: user.skills,
                        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
                    });
                } else {

                    done(new Error("user not fount"), null);
                }
            }
            catch (err) {

                done(err, null);
            }

        }
    );


    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", { session: false });
        }


    }
}
