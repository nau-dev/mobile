import { Place } from './place';
import { OfferCategory } from './offerCategory';
import { OfferCreate } from './offerCreate';
import { TimeFrames } from './timeFrames';

export class Offer extends OfferCreate {
    id: string;
    picture_url: string;
    company?: Place;
    status: string;
    // category?: OfferCategory
    deleted_at: string;
    account_id: string;
    // categories?: OfferCategory[];
    created_at: string;
    updated_at: string;
    timeframes: TimeFrames[];
    redemptions_count?: number;
    type: string;
    gift_bonus_descr?: string;
}