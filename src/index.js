import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import _ from 'lodash';
import axios from 'axios';

const input = document.querySelector('input');
const btn = document.querySelector('button');
const gallery = document.querySelector('.gallery');

const API_KEY = '33302890-ea105e46da5a591cb4b446b85';

let pagesLoaded = 0;
let imagesLoaded = 0;
let hits = 1;

async function fetchImages(input, page = 1, outcomes = 20){
    const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${outcomes}`);
    hits = response.data.totalHits;
    imagesLoaded += 20;
    return response.data;
}

function handleForm(event){
    event.preventDefault();
    fetchImages(input.value).then(results => {
        if(results.hits.length < 1){
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        }
        else{
            cards(results.hits);
            Notiflix.Notify.success(`Hooray! We found ${results.totalHits} images.`);
        }
    });
    window.addEventListener('scroll', _.throttle(handleScroll, 1500));
}

btn.addEventListener('click', handleForm);

function cards(hits, clear = true) {
    if (clear) {
      gallery.innerHTML = '';
    }
    
    hits.forEach(el => {
        const card = document.createElement('div');
        card.classList.add('photo-card');
    
        const lightBoxLink = document.createElement('a');
        lightBoxLink.setAttribute('href', el['largeImageURL']);
    
        const image = document.createElement('img');
        image.src = el['webformatURL'];
        image.alt = el['tags'];
        image.setAttribute('loading', 'lazy');
    
        const info = document.createElement('div');
        info.classList.add('info');
        info.insertAdjacentHTML(
          'beforeend',
          `<p class="info-item">
          <b>Likes</b> </br>
          ${el['likes']}
        </p>
        <p class="info-item">
          <b>Views</b></br>
          ${el['views']}
        </p>
        <p class="info-item">
          <b>Comments</b></br>
          ${el['comments']}
        </p>
        <p class="info-item">
          <b>Downloads</b></br>
          ${el['downloads']}
        </p>`
        );
    
        lightBoxLink.insertAdjacentElement('beforeend', image);
        card.insertAdjacentElement('beforeend', lightBoxLink);
        card.insertAdjacentElement('beforeend', info);
        gallery.insertAdjacentElement('beforeend', card);
    });

    const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
      smoothScrolling();
    
      function smoothScrolling() {
        console.log('Smooth scrolling');
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      }
      lightbox.refresh();
}

function handleScroll() {
    const end =
        window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
        console.log('window.innerHeight', window.innerHeight);
        console.log('window.pageYOffset', window.pageYOffset);
        console.log('document.body.offsetHeight', document.body.offsetHeight);
        if (end) {
            if (imagesLoaded >= hits) {
                Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
                return;
            }
            pagesLoaded += 1;
            fetchImages(input.value, pagesLoaded).then(results => {
                cards(results.hits, false);
            });
        }
}