const express = require('express');
const path = require('path');
const https = require('https');
const axios = require('axios');
const exphbs = require('express-handlebars');
const app = express();

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
        }}
       }
      )
    );
  app.set('view engine', 'hbs');
  app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

// Favorite subreddits
let favSubreddits = ['webdev', 'programming', 'javascript', 'java', 'angular'];


// Routes
app.get('/', async(req, res, next) => {
    try {

    // Call reddit API to retrieve 2 top posts of today for each subreddit of the array
    const hotPostsObj = await (await getHottestPosts(favSubreddits));

    // const hotPostsObj = {
    //     webdev: [
    //       {
    //         title: 'TIL Edge has a 3D View to inspect the z-index and DOM nesting of elements',
    //         url: 'https://www.reddit.com/gallery/jrim1a',
    //         img: 'https://a.thumbs.redditmedia.com/-JFqFuknFMBwr_0j83p7Cwjgx0A6j3ghVklP7CA7ed0.jpg'
    //       },
    //       {
    //         title: 'Conditionally call a function with optional chaining',
    //         url: 'https://i.redd.it/r44ybtnkaby51.png',
    //         img: 'https://b.thumbs.redditmedia.com/X--HV8i53F7KGMBU2mIxyN0_4OZi-X0bcZOFLaJKjmI.jpg'
    //       }
    //     ],
    //     programming: [
    //       {
    //         title: 'Attention Is My Most Valuable Asset for Productivity as a Software Developer',
    //         url: 'https://zwbetz.com/attention-is-my-most-valuable-asset-for-productivity-as-a-software-developer/',
    //         img: ''
    //       },
    //       {
    //         title: '.NET 5.0 Released',
    //         url: 'https://devblogs.microsoft.com/dotnet/announcing-net-5-0/',
    //         img: ''
    //       }
    //     ],
    //     javascript: [
    //       {
    //         title: "Six of JavaScript's Biggest Design Flaws",
    //         url: 'https://thecarrots.io/blog/javascript-wtf-six-of-the-languages-gravest-design-flaws',
    //         img: ''
    //       },
    //       {
    //         title: 'How Storybook built component search for speed',
    //         url: 'https://storybook.js.org/blog/new-component-finder-and-sidebar/?ref=reddit',
    //         img: ''
    //       }
    //     ],
    //     brawl: [
    //         {
    //           title: "Six of JavaScript's Biggest Design Flaws",
    //           url: 'https://thecarrots.io/blog/javascript-wtf-six-of-the-languages-gravest-design-flaws',
    //           img: ''
    //         },
    //         {
    //           title: 'How Storybook built component search for speed',
    //           url: 'https://storybook.js.org/blog/new-component-finder-and-sidebar/?ref=reddit',
    //           img: ''
    //         }
    //       ],
    //       food: [
    //         {
    //           title: "Six of JavaScript's Biggest Design Flaws",
    //           url: 'https://thecarrots.io/blog/javascript-wtf-six-of-the-languages-gravest-design-flaws',
    //           img: ''
    //         },
    //         {
    //           title: 'How Storybook built component search for speed',
    //           url: 'https://storybook.js.org/blog/new-component-finder-and-sidebar/?ref=reddit',
    //           img: ''
    //         }
    //       ]
    //   };

    console.log(hotPostsObj);

    res.render('index', {"pageTitle": "Home", "hotPostsObj": hotPostsObj});
    } catch(err) {
        next(err);
    }
});

app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
  });

app.listen(3000, () => console.log("Listen on port 3000"));


 async function getHottestPosts(favSubreddits)  {
    var postsObj = {};
    try {
    for (const subreddit of favSubreddits) {
        let url = 'https://www.reddit.com/r/' + subreddit + '/hot.json?limit=10';
        let options = {
            method: 'GET',
            url: url,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
                
            }
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