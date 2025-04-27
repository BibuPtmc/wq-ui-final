import React from "react";
import { useTranslation } from 'react-i18next';
import CatList from "./CatList";

function FoundCats() {
  const { t } = useTranslation();

  return (
    <CatList
      type="found"
      title={t('foundCats.title', 'Chats trouvés')}
      loadingText={t('foundCats.loading', 'Chargement des chats trouvés...')}
      noResultsTitle={t('foundCats.noResultsTitle', 'Aucun chat trouvé ne correspond à vos critères')}
      noResultsText={t('foundCats.noResultsText', 'Essayez de modifier vos filtres ou revenez plus tard.')}
      resetFiltersText={t('foundCats.resetFilters', 'Réinitialiser les filtres')}
      moreInfoText={t('foundCats.moreInfo', "Plus d'informations")}
      searchingText={t('foundCats.searching', 'Recherche...')}
      searchMatchesText={t('foundCats.searchMatches', 'Rechercher des correspondances')}
      matchCountText="foundCats.matchCount"
    />
  );
}

export default FoundCats;