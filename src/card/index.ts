import { Card as CardRoot } from "./Card";
import {
  CardBody,
  CardFooter,
  CardHeader,
  CardSeparator,
  CardSubtitle,
  CardTitle,
} from "./CardLayout";
import { CardMedia } from "./CardMedia";

type CardComponent = typeof CardRoot & {
  Media: typeof CardMedia;
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Subtitle: typeof CardSubtitle;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Separator: typeof CardSeparator;
};

const Card = CardRoot as CardComponent;
Card.Media = CardMedia;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Separator = CardSeparator;

export { Card };
export type {
  CardMediaProps,
  CardPadding,
  CardProps,
  CardSectionProps,
  CardSectionSurface,
  CardSeparatorInset,
  CardSeparatorProps,
  CardTitleProps,
  CardVariant,
} from "./Card.types";
