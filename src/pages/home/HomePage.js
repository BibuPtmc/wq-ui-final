import React from "react";
import { Carousel, Container, Button, Alert } from "react-bootstrap";
import img1 from "../../image/1.jpg";
import img2 from "../../image/2.jpg";
import img3 from "../../image/3.jpg";
import LostCatsMap from "../../components/map/LostCatsMap";
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={img1}
            alt="First slide"
            style={{ maxHeight: "630px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h1>Whisker Quest</h1>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={img2}
            alt="Second slide"
            style={{ maxHeight: "630px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h1>Whisker Quest</h1>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={img3}
            alt="Third slide"
            style={{ maxHeight: "630px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h1>Whisker Quest</h1>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className="my-5">
        <LostCatsMap 
          noLostCatsMessage={
            <Alert variant="success" className="text-center">
              {t('home.noLostCats', 'Bonne nouvelle ! Aucun chat n\'est perdu dans votre région.')}
            </Alert>
          } 
        />
      </Container>

      <Container className="mt-5">
        <h2>{t('home.valuesTitle', 'Nos Valeurs')}</h2>
        <p>{t('home.valuesIntro', 'Chez Whisker Quest, nous sommes guidés par un ensemble de valeurs qui nous inspirent dans tout ce que nous faisons. Voici quelques-unes de nos valeurs principales :')}</p>
        <ul>
          <li>{t('home.valueIntegrity', 'Intégrité')}</li>
          <li>{t('home.valueInnovation', 'Innovation')}</li>
          <li>{t('home.valueCommunity', 'Engagement envers la communauté')}</li>
          <li>{t('home.valueEnvironment', "Respect de l'environnement")}</li>
        </ul>

        <Button variant="primary" href="/app" className="mt-3">
          {t('home.discoverApp', 'Découvrir Notre Application')}
        </Button>
      </Container>

      <Container className="mt-5">
        <h2>{t('home.promoTitle', 'Promotion de Notre Prochaine Application')}</h2>
        <p>{t('home.promoText', "Nous sommes ravis de vous annoncer le lancement prochain de notre toute nouvelle application mobile ! Restez à l'écoute pour plus d'informations sur les fonctionnalités et la date de sortie.")}</p>
        <Button variant="success" href="/app" className="mt-3">
          {t('home.learnMoreApp', "En savoir plus sur l'Application")}
        </Button>
      </Container>
    </div>
  );
};

export default HomePage;
