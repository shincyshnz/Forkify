import { API_URL, KEY, RESULTS_PER_PAGE } from "./config";
import { getJSON, sendJSON } from "./View/helper";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RESULTS_PER_PAGE,
    },
    bookmarks: [],
}

export const createRecipeObject = (data) => {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key : recipe.key}),
    }
}

export const loadRecipe = async (id) => {
    try {
        const data = await getJSON(`${API_URL}${id}`);
        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) {
            state.recipe.bookmarked = true;
        } else {
            state.recipe.bookmarked = false;
        }
    } catch (error) {
        throw error;
    }
}

export const loadSearchResults = async (query) => {
    try {
        state.search.query = query;

        const { data } = await getJSON(`${API_URL}?search=${query}`);

        state.search.results = data?.recipes.map(rec => ({
            id: rec.id,
            title: rec.title,
            publisher: rec.publisher,
            image: rec.image_url,
        }));
        state.search.page = 1;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getSearchResultsPage = (page = state.search.page) => {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage; //0;
    const end = page * state.search.resultsPerPage;// 9;

    return state.search.results.slice(start, end);
}

export const updateServings = (newServings) => {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    });

    state.recipe.servings = newServings;
};

const persistBookmarks = () => {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = (recipe) => {
    // Add bookmark
    state.bookmarks.push(recipe);

    // mark current recipe as bookmark
    if (recipe.id === state.recipe.id) {
        state.recipe.bookmarked = true;
    }

    // Update localstorage
    persistBookmarks();
}

export const deleteBookmark = (id) => {
    const index = state.bookmarks.findIndex(el => el.id === id)
    state.bookmarks.splice(index, 1);

    // mark current recipe as not bookmarks
    if (id === state.recipe.id) {
        state.recipe.bookmarked = false;
    }

    // Update localstorage
    persistBookmarks();
}

export const uploadRecipe = async (newRecipe) => {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3) throw new Error("Wrong ingredient format. Please use the correct format")
                const [quantity, unit, description] = ing[1].replaceAll(' ', '').split(',');
                return { quantity: quantity ? +quantity : null, unit, description }
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };
        const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (error) {
        throw error;
    }
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();

// Developing purpose
// const clearBookmarks = () => {
//     localStorage.clear('bookmarks');
// }
// clearBookmarks();