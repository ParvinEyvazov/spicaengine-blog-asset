import * as Bucket from "@spica-devkit/bucket";

const BLOG_BUCKET_ID = process.env.BLOG_BUCKET_ID;
const CATEGORY_BUCKET_ID = process.env.CATEGORY_BUCKET_ID;
const CONTACT_BUCKET_ID = process.env.CONTACT_BUCKET_ID;
const REVIEW_BUCKET_ID = process.env.REVIEW_BUCKET_ID;
const SECRET_API_KEY = process.env.SECRET_API_KEY;

export async function addBlog(action) {
  //when add blog increase number of article in category
  const blog = action.current;
  const category_id = blog.category;

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  if (category_id) {
    const category = await Bucket.data.get(
      `${CATEGORY_BUCKET_ID}`,
      category_id
    );

    category.number_of_articles = category.number_of_articles + 1;

    await Bucket.data
      .update(`${CATEGORY_BUCKET_ID}`, category._id, category)
      .then((data) => {
        console.log("Number of articles in Category Bucket updated", data);
      })
      .catch((error) => {
        console.log("ERROR. Number of articles in Category Bucket updated");
      });
  }
}

export async function deleteBlog(action) {
  //when delete blog increase number of article in category
  const blog = action.previous;
  const category_id = blog.category;

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  if (category_id) {
    const category = await Bucket.data.get(
      `${CATEGORY_BUCKET_ID}`,
      category_id
    );

    category.number_of_articles = category.number_of_articles - 1;

    await Bucket.data
      .update(`${CATEGORY_BUCKET_ID}`, category._id, category)
      .then((data) => {
        console.log("Number of articles in Category Bucket updated", data);
      })
      .catch((error) => {
        console.log("ERROR. Number of articles in Category Bucket updated");
      });
  }
}

export async function addReview(action) {
  //review atilan blog-u bulup onun number_of_ration, average_of_rating-i update et

  const review = action.current;
  const blog_id = review.blog;

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  const blog = await Bucket.data.get(`${BLOG_BUCKET_ID}`, blog_id);

  blog.average_of_rating = calculateAverageWhenAdding(
    blog.average_of_rating,
    blog.number_of_rating,
    review.score
  );

  blog.number_of_rating = blog.number_of_rating + 1;

  await Bucket.data
    .update(`${BLOG_BUCKET_ID}`, blog._id, blog)
    .then((data) => {
      console.log("Rating numbers updated", data);
    })
    .catch((error) => {
      console.log("ERROR in rating numbers updated", error);
    });
}

export async function deleteReview(action) {
  //review-i silinen blog-u bulup onun number_of_ration, average_of_rating-i update et
  const review = action.previous;
  const blog_id = review.blog;

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  const blog = await Bucket.data.get(`${BLOG_BUCKET_ID}`, blog_id);

  blog.average_of_rating = calculateAverageWhenDeleting(
    blog.average_of_rating,
    blog.number_of_rating,
    review.score
  );
  blog.number_of_rating = blog.number_of_rating - 1;

  await Bucket.data
    .update(`${BLOG_BUCKET_ID}`, blog._id, blog)
    .then((data) => {
      console.log("Rating numbers updated", data);
    })
    .catch((error) => {
      console.log("ERROR in rating numbers updated", error);
    });
}

//helper functions
function calculateAverageWhenAdding(oldAverage, oldCount, newScore) {
  return (oldAverage * oldCount + newScore) / (oldCount + 1);
}

function calculateAverageWhenDeleting(oldAverage, oldCount, deletedScore) {
  return (oldAverage * oldCount - deletedScore) / (oldCount - 1);
}
