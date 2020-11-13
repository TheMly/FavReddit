// import axios from 'axios';

$(function() {

  // Load initial data with 'Hot' as default

  // Add listener to ajax the lists content 

  const getTodos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/getPostsType');
  
      const postsType = res.data;
  
      console.log(`GET: Here's the posts type`, postsType);
  
      
    } catch (e) {
      console.error(e);
    }
  };

  getTodos();
  
    $('select').on('change', function() {
        console.log(this.value);
      });

    $("select[name='postsType'] option[value='Top Past Week']").attr('selected','selected');
});