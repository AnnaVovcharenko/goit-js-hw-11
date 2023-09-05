import { Loading } from 'notiflix';
import { fetchImg, limitPage, renderImg } from './requests'
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const ref = {
    formSearch: document.querySelector('.search-form'),
    divGallery: document.querySelector('.gallery'),
    buttonLoad: document.querySelector('.load-more'),
    target: document.querySelector('.target')
}
const gallareDiv = ref.divGallery;
let queryFetch = '';
let pageFetch = 1;
ref.formSearch.addEventListener("submit", onSubmitForm);

//Ініціалізація біблітеки SimpleLightbox
const simpleBox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt', // отримуємо заголовок
    captionDelay: 250, // затримка
});
//скрол через обсервер
const obsScroll = new IntersectionObserver(onObsScroll, { rootMargin: '300px' });
//Функція яка робить запит та отримує галерею зображення при сабміті форми 
function onSubmitForm(e) {
    e.preventDefault();
    const query = e.currentTarget.elements.searchQuery.value;
    if (!query.trim() || query === queryFetch) {
        return;
    }
    queryFetch = query;   
    ref.divGallery.innerHTML = '';  
    firstNumberImg(queryFetch, pageFetch); // додаємо функцію що відповідає за  кількість картинок при першому запиті
    ref.formSearch.reset();
}
// Функція що відповідає за  групу картинок при першому запиті (з використанням синтаксу async/await)

const firstNumberImg = async (queryFetch, pageFetch) => {
    try {
        Loading.circle('Loading', {
            svgColor: '#9a25be',
        });
        const data = await fetchImg(queryFetch, pageFetch);
        Loading.remove();
        if (!data.totalHits) { //Якщо бекенд повертає порожній масив
            Notify.failure(
                "Sorry, there are no images matching your search query. Please try again."
            );
            return;
        }
        renderImg(data); // Функція, що генерує розмітку галереї картинок
        //Викликаємо метод refresh бібліотеки simplelightbox 
        simpleBox.refresh();

        if (pageFetch === 1) { //Після першого запиту з кожним новим пошуком 
            //отримуємо повідомлення скільки всього знайшли зображень
            Notify.success(`Hooray! We found ${data.totalHits} images.`);
            obsScroll.observe(ref.target);
        }
        if (data.totalHits <= pageFetch * limitPage) {
            Notify.failure(
                "We're sorry, but you've reached the end of search results." 
            )
        }

    } catch (error) {
        console.log(error);//помилка
        Notify.failure('Oops! Something went wrong!')
    }
};
//функція що відповідає за нескінченне завантаження зображень під час прокручування сторінки 
function onObsScroll(entries) {
    entries.forEach(entry => {
        console.log(entry);
        if (entry.isIntersecting) {
            pageFetch += 1;
            smoothScroll();//добавлена функція прокручування сторінки 
            fetchImg(queryFetch, pageFetch)
                .then(data => {
                    renderImg(data);
                    simpleBox.refresh();
                    if (pageFetch > data.totalHits / limitPage) {
                        obsScroll.unobserve(ref.target);
                    }                   
                })
                .catch(err => Notify.failure(err.message))
                .finally(() => Loading.remove());
        }
    });
    
}
//функція прокручування сторінки 
function smoothScroll() {
    // додане плавне прокручування сторінки на висоту 2х карток галереї (додатково)
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}



export { gallareDiv }