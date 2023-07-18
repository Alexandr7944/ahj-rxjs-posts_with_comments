/* eslint-disable prettier/prettier */
import { of } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

const host = "https://ahj-rxjs-posts-with-comments-back.onrender.com";

const comments = (post) => {
  return ajax.get(`${host}/posts/${post.id}/comments/latest?amount=3`)
    .pipe(
      map(({ response }) => ({...post, comments: response.data})),
      catchError((error) => {
        return of( error.response );
      }),
    );  
}

const posts$ = ajax.get(host + "/posts/latest?amount=10")
.pipe(
  map(({ response }) => response.data),
  catchError((error) => {
    return of( error.response );
  }),
);

const getDate = time => {
  const date = new Date(time);
  return date.getHours() + ':' + date.getMinutes() + ' ' + date.toLocaleDateString();
}

posts$.subscribe((arr) => {
  if (!arr) return;
  const container = document.querySelector('.polling__container');

  arr.map((post) => comments(post).subscribe((newPost) => {
    const message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = `
      <img class="message__avatar" src=${newPost.avatar} />
      <span class="message__from">${newPost.author}</span>
      <div class="message__image">
        <img class="message__image" src=${newPost.image}/>
      </div>
      <span class="message__subject">${newPost.title}</span>
      <span class="message__time">${getDate(newPost.created).toLocaleString()}</span>
      <div class="message__comments"></div>
      <button class="message__add-comments">Show more</button>
    `;

    const comments = message.querySelector('.message__comments');
    addComments(newPost.comments.slice(0, 2), comments);

    const btnAddComments = message.querySelector('.message__add-comments');
    btnAddComments.addEventListener('click', () => {
      addComments(newPost.comments.slice(2), comments);
      btnAddComments.remove();
    });

    container.prepend(message);
  }));
});

function addComments(arr, comments) {
  arr.forEach(comment => 
    comments.innerHTML += `
      <img class="message__avatar" src=${comment.avatar} />
      <span class="message__from">${comment.author}</span>
      <p class="message__comment">${comment.content}</p>
    `
  );
}