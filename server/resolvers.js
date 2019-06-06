const {ApolloError} = require('apollo-server');
const {minioClient} = require('./minioClient')

const resolvers = {
    User: {
      uploads: async ({userID}, variables, {Upload}) => {
        // console.log(userID)
        return await Upload.find({bucketName: userID})
       // return filter(uploads, { user: user.name });
      },
    },
    Query: {
      user: async (parent, {userID}, {User}) => {
        return await User.findOne({userID})
        //return context.Uploads.find(user, { id: args.id });
      },
      uploads: async (parent, {userID}, {Upload}) => {
        return await Upload.find({bucketName: userID})
        //return context.Users.find(uploads)
      }
    },
    Mutation: {
      authenticate: async (parent, {username, password}, {User}) =>{
        // console.log('auth', username, password)
        const returningUser = await User.findOne({username, password})
        if (!returningUser){
          throw new ApolloError('Username or password is invalid')
        }
        return returningUser
      },
      register: async (parent, {username, password}, {User}) =>{
        const existing =  await User.findOne({username});
        if (!existing){
          const newUser = new User({ username, password});
          // console.log('New user');
          const {userID} = await newUser.save()
          // Make a bucket with the user's ID.
          minioClient.makeBucket(`${userID}`, 'us-east-1', function(err) {
            if (err) return console.log(err)
            console.log('Users bucket created successfully in "us-east-1".')
          })
          return newUser
        } else {
          throw new ApolloError('User already exists')
        }
      }
    },
  };
  
module.exports={
    resolvers
}