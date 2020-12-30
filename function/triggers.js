import * as Bucket from "@spica-devkit/bucket";

const ARTICLE_BUCKET_ID = process.env.ARTICLE_BUCKET_ID;
const CATEGORY_BUCKET_ID = process.env.CATEGORY_BUCKET_ID;
const CONTACT_BUCKET_ID = process.env.CONTACT_BUCKET_ID;
const REVIEW_BUCKET_ID = process.env.REVIEW_BUCKET_ID;
const SECRET_API_KEY = process.env.SECRET_API_KEY;

export async function addArticle(action) {
  //when add article increase number of article in category
  const article = action.current;
  const category_id = article.category;

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

export async function deleteArticle(action) {
  //when delete article increase number of article in category
  const article = action.previous;
  const category_id = article.category;

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
  //review atilan article-i bulup onun number_of_ration, average_of_rating-i update et
  console.log("process.env: ", process.env);

  const review = action.current;
  const article_id = review.article;
  console.log("review : ", review);

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  const article = await Bucket.data.get(`${ARTICLE_BUCKET_ID}`, article_id);

  console.log("article: ", article);

  article.average_of_rating = calculateAverageWhenAdding(
    article.average_of_rating,
    article.number_of_rating,
    review.score
  );

  console.log("updated article: ", article);

  article.number_of_rating = article.number_of_rating + 1;

  await Bucket.data
    .update(`${ARTICLE_BUCKET_ID}`, article._id, article)
    .then((data) => {
      console.log("Rating numbers updated", data);
    })
    .catch((error) => {
      console.log("ERROR in rating numbers updated", error);
    });
}

export async function deleteReview(action) {
  //review-i silinen article-i bulup onun number_of_ration, average_of_rating-i update et
  const review = action.previous;
  const article_id = review.article;

  Bucket.initialize({ apikey: `${SECRET_API_KEY}` });

  const article = await Bucket.data.get(`${ARTICLE_BUCKET_ID}`, article_id);

  article.average_of_rating = calculateAverageWhenDeleting(
    article.average_of_rating,
    article.number_of_rating,
    review.score
  );
  article.number_of_rating = article.number_of_rating - 1;

  await Bucket.data
    .update(`${ARTICLE_BUCKET_ID}`, article._id, article)
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
