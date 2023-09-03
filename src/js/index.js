1111111
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
let searchQuery = null;
let queryFetch = '';
let pageFetch = '';
ref.formSearch.addEventListener("submit", onSubmitForm);
//ref.buttonLoad.addEventListener("click", onClickButton);
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
    obsScroll.observe(ref.target);
    ref.divGallery.innerHTML = '';
    pageFetch = 1;
    firstNumberImg(queryFetch, pageFetch); // додаємо функцію що відповідає за  кількість картинок при першому запиті
    ref.formSearch.reset();
}
// Функція що відповідає за  групу картинок при першому запиті (з використанням синтаксу async/await)

const firstNumberImg = async (query, pageFetch) => {
    try {
        Loading.circle('Loading', {
            svgColor: '#9a25be',
        });
        const data = await fetchImg(query, pageFetch);
        Loading.remove();
        if (!data.hits.length) { //Якщо бекенд повертає порожній масив
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
    } catch (error) {
        console.log(error);//помилка
        Notify.failure('Oops! Something went wrong!')
    }
};
function onObsScroll(entries) {
    entries.forEach(entry => {
        console.log(entry);
        if (entry.isIntersecting) {
            pageFetch++;
            fetchImg(searchQuery, pageFetch)
                .then(({ data: { totalHits, hits } }) => {
                    renderImg(hits);
                    ref.divGallery.refresh();
                    if (pageFetch > totalHits / limitPage) {
                        obsScroll.unobserve(ref.target);

                    }
                })
                .catch(err => Notify.failure(err.message))
                .finally(() => Loading.remove());
        }
    });
}







export { gallareDiv }