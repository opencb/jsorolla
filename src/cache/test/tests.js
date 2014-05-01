/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 10/9/13
 * Time: 6:00 PM
 * To change this template use File | Settings | File Templates.
 */

test("Adding and Getting", function() {
    var memoryStore = new MemoryStore();
    var feature = {chromosome: '1', start: '1', end: '10'};
    memoryStore.add("1_1", feature);
    ok( memoryStore.get("1_1") == feature, "Passed!" );
});

test("Adding and Getting", function() {
    var memoryStore = new MemoryStore();
    var feature = {chromosome: '1', start: '1', end: '10'};
    memoryStore.add("1_1", feature);
    memoryStore.add("1_2", feature);
    memoryStore.add("1_3", feature);
    memoryStore.add("1_4", feature);
    memoryStore.add("1_5", feature);

    var value = memoryStore.get("1_3");

    var value = memoryStore.get("1_5");

    ok( memoryStore.get("1_5") == feature, "Passed!" );
//    memoryStore.free();
});
