/**
 * 4-generation test family with twins, adoptions, and carriers
 *
 * Generation 0 (Great-grandparents):
 *   - GGF1 (1) + GGM1 (2) -> GM1 (5)
 *   - GGF2 (3) + GGM2 (4) -> GM2 (6)
 *
 * Generation 1 (Grandparents):
 *   - GF1 (7) + GM1 (5) -> F1 (11)
 *   - GF2 (8) + GM2 (6) -> M1 (12)
 *
 * Generation 2 (Parents):
 *   - F1 (11) + M1 (12) -> C1 (15), C2 (16) - twins
 *
 * Generation 3 (Children):
 *   - C1 (15), C2 (16)
 */

export default {
    "name": "4-Generation Test Family",
    "version": "2.0",
    "disorders": [
        {"id": "disorder1", "name": "Disorder 1"},
        {"id": "disorder2", "name": "Disorder 2"}
    ],
    "members": [
        // Generation 0 - Great-grandparents
        {
            "id": "1",
            "name": "GGF1",
            "sex": "MALE",
            "age": "90",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "2",
            "name": "GGM1",
            "sex": "FEMALE",
            "age": "88",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "3",
            "name": "GGF2",
            "sex": "MALE",
            "age": "92",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "4",
            "name": "GGM2",
            "sex": "FEMALE",
            "age": "89",
            "lifeStatus": "DECEASED",
            "carrier": true
        },

        // Generation 1 - Grandparents
        {
            "id": "5",
            "name": "GM1",
            "father": {"id": "1"},
            "mother": {"id": "2"},
            "sex": "FEMALE",
            "age": "65"
        },
        {
            "id": "6",
            "name": "GM2",
            "father": {"id": "3"},
            "mother": {"id": "4"},
            "sex": "FEMALE",
            "age": "63",
            "carrier": true
        },
        {
            "id": "7",
            "name": "GF1",
            "sex": "MALE",
            "age": "67"
        },
        {
            "id": "8",
            "name": "GF2",
            "sex": "MALE",
            "age": "64"
        },

        // Generation 2 - Parents
        {
            "id": "11",
            "name": "F1",
            "father": {"id": "7"},
            "mother": {"id": "5"},
            "sex": "MALE",
            "age": "40",
            "disorders": [{"id": "disorder1"}]
        },
        {
            "id": "12",
            "name": "M1",
            "father": {"id": "8"},
            "mother": {"id": "6"},
            "sex": "FEMALE",
            "age": "38",
            "carrier": true
        },

        // Generation 3 - Children (twins)
        {
            "id": "15",
            "name": "C1",
            "father": {"id": "11"},
            "mother": {"id": "12"},
            "sex": "MALE",
            "age": "10",
            "twinGroup": "twin-1",
            "twinType": "MONOZYGOTIC",
            "proband": true,
            "disorders": [{"id": "disorder2"}]
        },
        {
            "id": "16",
            "name": "C2",
            "father": {"id": "11"},
            "mother": {"id": "12"},
            "sex": "FEMALE",
            "age": "10",
            "twinGroup": "twin-1",
            "twinType": "MONOZYGOTIC",
            "adopted": true
        }
    ]
};
