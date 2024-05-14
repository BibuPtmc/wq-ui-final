import React from "react";
import { Carousel, Container, Button } from "react-bootstrap";
import img1 from "./image/1.jpg";
import img2 from "./image/2.jpg";
import img3 from "./image/3.jpg";

const HomePage = () => {
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
            <h3>Whisker Quest</h3>
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
            <h3>Whisker Quest</h3>
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
            <h3>Whisker Quest</h3>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className="mt-5">
        <h2>Nos Valeurs</h2>
        <p>
          Chez Whisker Quest, nous sommes guidés par un ensemble de valeurs qui
          nous inspirent dans tout ce que nous faisons. Voici quelques-unes de
          nos valeurs principales :
        </p>
        <ul>
          <li>Intégrité</li>
          <li>Innovation</li>
          <li>Engagement envers la communauté</li>
          <li>Respect de l'environnement</li>
        </ul>

        <Button variant="primary" href="/app" className="mt-3">
          Découvrir Notre Application
        </Button>
      </Container>

      <Container className="mt-5">
        <h2>Promotion de Notre Prochaine Application</h2>
        <p>
          Nous sommes ravis de vous annoncer le lancement prochain de notre
          toute nouvelle application mobile ! Restez à l'écoute pour plus
          d'informations sur les fonctionnalités et la date de sortie.
        </p>
        <Button variant="success" href="/app" className="mt-3">
          En savoir plus sur l'Application
        </Button>
      </Container>
    </div>
  );
};

export default HomePage;
