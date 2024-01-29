import { API_URL, RESULTS_PER_PAGE } from "./config";
import { getJSON } from "./View/helper";

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

export const loadRecipe = async (id) => {
    try {
        const data = await getJSON(`${API_URL}${id}`);

        let { recipe } = data?.data;
        state.recipe = {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients,
            servings: recipe.servings
        }

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


export const addBookmark = (recipe) => {
    // Add bookmark
    state.bookmarks.push(recipe);

    // mark current recipe as bookmark
    if (recipe.id === state.recipe.id) {
        state.recipe.bookmarked = true;
    }
}

export const deleteBookmark = (id) => {
    const index = state.bookmarks.findIndex(el => el.id === id)
    state.bookmarks.splice(index, 1);

    // mark current recipe as not bookmarks
    if (id === state.recipe.id) {
        state.recipe.bookmarked = false;
    }
}