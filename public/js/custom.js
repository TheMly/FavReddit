$(function() {

  // Add listener to ajax the lists content 
  $('select').on('change', async function() {
        console.log(this.value);
        $('#posts-list').html('Loading...');
        let postsObj = await getPosts(this.value);
        updatePostsView(postsObj);   
        $("select[name='postsType'] option[value='" + this.value + "']").attr('selected','selected');
  });
});

async function getPosts(postsType) {
  var postsObj = {};
  try {
      let url = getServerUrl() + '/getPosts';
      let options = {
          method: 'GET',
          url: url,
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json;charset=UTF-8'
          },
          params: {postsType}
      };
      let response = await axios(options);
      let responseOK = response && response.status === 200 && response.statusText === 'OK';
      const postsArr = [];
      if (responseOK) {
          let data = await response.data;
          return data; 
      } else {
        return '';
      }
  } catch(err) {
      console.log(err);
  }
  return postsObj;
}

async function bootHotPosts() {
  // Load initial data with 'Hot' as default
  let postsObj = await getPosts('hot');  
  updatePostsView(postsObj);  
  // When the page has loaded
  jQuery("body").css("visibility","visible");
  jQuery("body").css("display","none");
  jQuery("body").fadeIn(1200);
}

function updatePostsView(postsObj) {
  // Retrieve the template data from the HTML (jQuery is used here).
  var template = $('#handlebars-demo').html();

  // Compile the template data into a function
  var templateScript = Handlebars.compile(template);

  var context = postsObj;

  var html = templateScript(context);

  // Insert the HTML code into the page
  $('#posts-list').html(html);
}

function getServerUrl() {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return  'http://localhost:3000'; 
  } else {
    return 'https://favreddit.herokuapp.com';
}
}