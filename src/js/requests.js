import { gallareDiv } from './index';
import axios from 'axios';
const API_KEY = '39130708-8822508b9719607ff3135caf6'

//Ліміт отриманих об'єктів на сторінці
const limitPage = 40;
axios.defaults.baseURL = 'https://pixabay.com/api/';
// Функція запиту картинок з використанням синтаксу async/await
// queryFetch - термін для пошуку картинок; pageFetch - Визначає кількість результатів на сторінці.  
const fetchImg = async (queryFetch, pageFetch) => {
    const { data } = await axios({
        params: {
            key: API_KEY,
            q: queryFetch,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: limitPage,
            page: pageFetch,
        }
    });
    return data;
}
//Функція, що генерує розмітку галереї картинок
//(У розмідці додано <a></a>, для великої версії зображення, як зазначено в документації SimpleLightbox .)
function renderImg(data) {
    const markup = data.hits
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => {
                return `<a class="photo-link" href="${largeImageURL}">
                <div class="photo-card">
                <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
                <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
                </div>
                </div>
                </a>`
            }
        )
        .join('');
    gallareDiv.insertAdjacentHTML('beforeend', markup);

    
};



//Іменований експорт  
export { fetchImg, limitPage, renderImg };