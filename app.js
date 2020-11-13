const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Favorite subreddits
let favSubreddits = ['webdev', 'programming', 'javascript', 'java', 'Angular2'];

// Routes
app.get('/', async(req, res, next) => {
    try {
        res.sendFile('index.html', {root : __dirname + '/public/views'});
    } catch(err) {
            next(err);
        }}
);

app.get('/getPosts', async(req, res, next) => {
    try {
        console.log(req.query.postsType)
        let postsObj = await getPosts(req.query.postsType)
        res.send( {"postsObj": postsObj} );
    } catch(err) {
            next(err);
        }}
);

app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
  });

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => console.log("Listen on port 3000"));


async function getPosts(postsType) {
    var postsObj = {};
    try {
    for (const subreddit of favSubreddits) {
        let url = 'https://www.reddit.com/r/' + subreddit + '/' + getPostsType(postsType) + '.json' + '?limit=10' + getPostsTimeFilter(postsType);
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