import React from "react";
import { useTranslation } from 'react-i18next';
import CatList from "./CatList";

function LostCats() {
  const { t } = useTranslation();

  return (
    <CatList
      type="lost"
      title={t('lostCats.title', 'Chats perdus')}
      loadingText={t('lostCats.loading', 'Chargement des chats perdus...')}
      noResultsTitle={t('lostCats.noResultsTitle', 'Aucun chat perdu ne correspond à vos critères')}
      noResultsText={t('lostCats.noResultsText', 'Essayez de modifier vos filtres ou revenez plus tard.')}
      resetFiltersText={t('lostCats.resetFilters', 'Réinitialiser les filtres')}
      moreInfoText={t('lostCats.moreInfo', "Plus d'informations")}
      searchingText={t('lostCats.searching', 'Recherche...')}
      searchMatchesText={t('lostCats.searchMatches', 'Rechercher des correspondances')}
      matchCountText="lostCats.matchCount"
    />
  );
}

export default LostCats;