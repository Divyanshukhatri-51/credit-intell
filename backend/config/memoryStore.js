/** In-process store used only when MongoDB is unreachable. Not a service layer. */
const companies = new Map();
const financials = new Map();
const scores = [];
const sources = [];

module.exports = {
  companies,
  financials,
  scores,
  sources,
  reset() {
    companies.clear();
    financials.clear();
    scores.length = 0;
    sources.length = 0;
  },
};
