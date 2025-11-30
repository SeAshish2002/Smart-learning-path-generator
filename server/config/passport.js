// Passport configuration for OAuth (Google and GitHub)
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({
      where: {
        oauthProvider: 'google',
        oauthId: profile.id
      }
    });

    if (!user) {
      // Check by email
      user = await User.findOne({ where: { email: profile.emails[0].value } });
      
      if (user) {
        // Update existing user with OAuth info
        user.oauthProvider = 'google';
        user.oauthId = profile.id;
        user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          oauthProvider: 'google',
          oauthId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'student'
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
  }));
  console.log('✅ Google OAuth configured');
} else {
  console.log('ℹ️  Google OAuth not configured (optional)');
}

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({
      where: {
        oauthProvider: 'github',
        oauthId: profile.id.toString()
      }
    });

    if (!user) {
      // GitHub doesn't always provide email, so we use username
      const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
      
      // Check by email
      user = await User.findOne({ where: { email } });
      
      if (user) {
        // Update existing user
        user.oauthProvider = 'github';
        user.oauthId = profile.id.toString();
        user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email,
          name: profile.displayName || profile.username,
          oauthProvider: 'github',
          oauthId: profile.id.toString(),
          avatar: profile.photos[0]?.value,
          role: 'student'
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
  }));
  console.log('✅ GitHub OAuth configured');
} else {
  console.log('ℹ️  GitHub OAuth not configured (optional)');
}

module.exports = passport;

