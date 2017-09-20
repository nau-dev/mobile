import { Offer } from '../models/offer';
import { OfferCategory } from '../models/offerCategory';

export class MockOffers {

    public static items: Offer[] = [
        {
            image_url: "assets/img/place/offers_image1.png",
            label: "Chance for you",
            description: "A hamburger or burger is a sandwich consisting of one",
            reward: 1,
            start_date: "2017-09-15 16:38:17.000000+0200",
            finish_date: "2017-11-15 16:38:17.000000+0200",
            start_time: "16:38:17.000000+0200",
            finish_time: "16:38:17.000000+0200",
            country: "Ukraine",
            city: "Kiyv",
            max_count: 1,
            max_for_user: 1,
            max_per_day: 1,
            max_for_user_per_day: 1,
            user_level_min: 1,
            latitude: 50.466430,
            longitude: 30.669317,
            radius: 50000,
            categories_count: 1
        },
        {
            image_url: "assets/img/place/offers_image2.png",
            label: "Happy Friday",
            description: "The patty may be pan fried, barbecued, or flame broiled",
            reward: 1,
            start_date: "2017-09-15 16:38:17.000000+0200",
            finish_date: "2017-11-15 16:38:17.000000+0200",
            start_time: "16:38:17.000000+0200",
            finish_time: "16:38:17.000000+0200",
            country: "Ukraine",
            city: "Kiyv",
            max_count: 1,
            max_for_user: 1,
            max_per_day: 1,
            max_for_user_per_day: 1,
            user_level_min: 1,
            latitude: 50.466430,
            longitude: 30.669317,
            radius: 50000,
            categories_count: 1,
        },
        {
            image_url: "../assets/img/place/offers_image1.png",
            label: "Happy Burger",
            description: "A hamburger or burger is a sandwich consisting of one",
            reward: 1,
            start_date: "2017-09-15 16:38:17.000000+0200",
            finish_date: "2017-11-15 16:38:17.000000+0200",
            start_time: "16:38:17.000000+0200",
            finish_time: "16:38:17.000000+0200",
            country: "Ukraine",
            city: "Kiyv",
            max_count: 1,
            max_for_user: 1,
            max_per_day: 1,
            max_for_user_per_day: 1,
            user_level_min: 1,
            latitude: 50.466430,
            longitude: 30.669317,
            radius: 50000,
            categories_count: 1,
        }
    ]
}