/**
 * 4-generation test family with twins, adoptions, and carriers
 *
 * Generation 0 (Great-grandparents):
 *   - GGF1 (GGF1_ABC1234567890XY) + GGM1 (GGM1_DEF1234567890XY) -> GM1 (GM1_MNO1234567890XYZ)
 *   - GGF2 (GGF2_GHI1234567890XY) + GGM2 (GGM2_JKL1234567890XY) -> GM2 (GM2_PQR1234567890XYZ)
 *
 * Generation 1 (Grandparents):
 *   - GF1 (GF1_STU1234567890XYZ) + GM1 (GM1_MNO1234567890XYZ) -> F1 (FATHER1_VWX12345678)
 *   - GF2 (GF2_YZA1234567890XYZ) + GM2 (GM2_PQR1234567890XYZ) -> M1 (MOTHER1_BCD12345678)
 *
 * Generation 2 (Parents):
 *   - F1 (FATHER1_VWX12345678) + M1 (MOTHER1_BCD12345678) -> C1 (CHILD1_EFG123456789), C2 (CHILD2_HIJ123456789) - twins
 *
 * Generation 3 (Children):
 *   - C1 (CHILD1_EFG123456789), C2 (CHILD2_HIJ123456789)
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
            "id": "GGF1_ABC1234567890XY",
            "name": "GreatGrandfather1-A",
            "sex": "MALE",
            "age": "90",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "GGM1_DEF1234567890XY",
            "name": "GreatGrandmother1-B",
            "sex": "FEMALE",
            "age": "88",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "GGF2_GHI1234567890XY",
            "name": "GreatGrandfather2-C",
            "sex": "MALE",
            "age": "92",
            "lifeStatus": "DECEASED"
        },
        {
            "id": "GGM2_JKL1234567890XY",
            "name": "GreatGrandmother2-D",
            "sex": "FEMALE",
            "age": "89",
            "lifeStatus": "DECEASED",
            "carrier": true
        },

        // Generation 1 - Grandparents
        {
            "id": "GM1_MNO1234567890XYZ",
            "name": "Grandmother1-Smith",
            "father": {"id": "GGF1_ABC1234567890XY"},
            "mother": {"id": "GGM1_DEF1234567890XY"},
            "sex": "FEMALE",
            "age": "65"
        },
        {
            "id": "GM2_PQR1234567890XYZ",
            "name": "Grandmother2-Jones",
            "father": {"id": "GGF2_GHI1234567890XY"},
            "mother": {"id": "GGM2_JKL1234567890XY"},
            "sex": "FEMALE",
            "age": "63",
            "carrier": true
        },
        {
            "id": "GF1_STU1234567890XYZ",
            "name": "Grandfather1-Brown",
            "sex": "MALE",
            "age": "67"
        },
        {
            "id": "GF2_YZA1234567890XYZ",
            "name": "Grandfather2-Davis",
            "sex": "MALE",
            "age": "64"
        },

        // Generation 2 - Parents
        {
            "id": "FATHER1_VWX12345678",
            "name": "Father1-Johnson-XY",
            "father": {"id": "GF1_STU1234567890XYZ"},
            "mother": {"id": "GM1_MNO1234567890XYZ"},
            "sex": "MALE",
            "age": "40",
            "disorders": [{"id": "disorder1"}]
        },
        {
            "id": "MOTHER1_BCD12345678",
            "name": "Mother1-Williams-Z",
            "father": {"id": "GF2_YZA1234567890XYZ"},
            "mother": {"id": "GM2_PQR1234567890XYZ"},
            "sex": "FEMALE",
            "age": "38",
            "carrier": true
        },

        // Generation 3 - Children (twins)
        {
            "id": "CHILD1_EFG123456789",
            "name": "Child1-Anderson-AB",
            "father": {"id": "FATHER1_VWX12345678"},
            "mother": {"id": "MOTHER1_BCD12345678"},
            "sex": "MALE",
            "age": "10",
            "twinGroup": "twin-1",
            "twinType": "MONOZYGOTIC",
            "proband": true,
            "disorders": [{"id": "disorder2"}]
        },
        {
            "id": "CHILD2_HIJ123456789",
            "name": "Child2-Anderson-CD",
            "father": {"id": "FATHER1_VWX12345678"},
            "mother": {"id": "MOTHER1_BCD12345678"},
            "sex": "FEMALE",
            "age": "10",
            "twinGroup": "twin-1",
            "twinType": "MONOZYGOTIC",
            "adopted": true
        }
    ]
};
