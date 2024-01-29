import * as model from './model';
import recipeView from './View/recipeView';
import searchView from './View/searchView';
import resultView from './View/resultView';
import paginationView from './View/paginationView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    // Loader
    recipeView.renderSpinner();

    // ). Result view to mark Selected search result
    resultView.update(model.getSearchResultsPage());

    // 1. Load Recipe
    await model.loadRecipe(id);

    // 2. Render Recipe
    recipeView.render(model.state.recipe);

  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async () => {
  try {
    resultView.renderSpinner();

    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render search results
    // resultView.render(model.state.search.results);
    resultView.render(model.getSearchResultsPage());

    // 4) Render initial pagination button
    paginationView.render(model.state.search);
  } catch (error) {
    throw error;
  }
};

const controlPagination = (goToPage) => {
  // 1) Render new results
  resultView.render(model.getSearchResultsPage(goToPage));

  // 2) Render new pagination button
  paginationView.render(model.state.search);
}

const controlServings = (newServings) => {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // update the recipeView
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

// SUBSCRIBER - pass the controller functions to Publisher
function init() {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
} init();