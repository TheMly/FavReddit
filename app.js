const express = require('express');
const path = require('path');
const https = require('https');
const axios = require('axios');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.engine(
    'hbs',
    exphbs({
      layoutsDir: 'views/layouts/',
      defaultLayout: false,
      extname: 'hbs',
      helpers: {
        eachProperty: function(context, options) {
            var ret = "";
            for(var prop in context) {
                ret = ret + options.fn({property:prop,value:context[prop]});
            }
            return ret;
        },
       json: function(context) {
        return JSON.stringify(context);
       }
      }
     }
    )
    );
  app.set('view engine', 'hbs');
  app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

// Favorite subreddits
let favSubreddits = ['webdev', 'programming', 'javascript', 'java', 'Angular2', 'cats'];

// Routes
app.get('/searchPostsByType', async(req, res, next) => {
   console.log('I"m in /searchPostsByType')
   console.log(req.query.postsType);
   try {
    const hotPostsObj = await getHottestPosts(favSubreddits, req.query.postsType);    
    // console.log(hotPostsObj);
    let data = {"pageTitle": "Home", "hotPostsObj": hotPostsObj, "postsType": req.query.postsType}
    res.render('index', (data) );
    } catch(err) {
        next(err);
    }}
);

app.get('/getPostsType', async(req, res, next) => {
    console.log('I"m in //')
    try {
           
        // console.log(hotPostsObj);
        let data = {"postsType": 'Hot'};
        res.send(data);
    } catch(err) {
            next(err);
        }}
);

app.get('/', async(req, res, next) => {
    console.log('I"m in //')
    try {
        // Call reddit API
        const hotPostsObj = await getHottestPosts(favSubreddits, 'hot');    
        // console.log(hotPostsObj);
        let data = {"pageTitle": "Home", "hotPostsObj": hotPostsObj, "postsType": 'Hot'};
        res.render('index', (data) );
    } catch(err) {
            next(err);
        }}
);

app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
  });

app.listen(3000, () => console.log("Listen on port 3000"));

async function getHottestPosts(favSubreddits, postsType) {
    console.log(getPostsTimeFilter(postsType));
    var postsObj = {};
    try {
    for (const subreddit of favSubreddits) {
        let url = 'https://www.reddit.com/r/' + subreddit + '/' + getPostsType(postsType) + '.json' + '?limit=10' + getPostsTimeFilter(postsType);
        console.log(url);
        let options = {
            method: 'GET',
            url: url,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {}
        };
        let response = await axios(options);
        let responseOK = response && response.status === 200 && response.statusText === 'OK';
        const postsArr = [];
        if (responseOK) {
            let data = await response.data;
            //console.log(data.data.children[0].data);
            for (const post of data.data.children) {
                if(!post.data.stickied) {
                let Post = ({title:post.data.title,
                             url:post.data.url,
                             img:post.data.thumbnail,
                             commentsUrl: "https://www.reddit.com" + post.data.permalink});    
                postsArr.push(Post);
                }
            }
            postsObj[subreddit] = postsArr;    
            }
        }
    } catch(err) {
        console.log(err);
    }
    return postsObj;
}

function getPostsType(postsType) {
    let x =  postsType.includes('Top') ? 'top' : 'hot';
    console.log(x);
    return x;
}

function getPostsTimeFilter(postsType) {
    switch(postsType) {
        case 'Hot': return '';
        case 'Top Past Week': return '&t=week';
        case 'Top Past Month': return '&t=month';
        case 'Top Past Year': return '&t=year';
        case 'Top All Time': return '&t=all';
        default: return '';
    }
}