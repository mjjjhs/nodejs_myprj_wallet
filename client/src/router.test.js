const rewire = require("rewire")
const router = rewire("./router")
const requireAuth = router.__get__("requireAuth")
// @ponicode
describe("requireAuth", () => {
    test("0", () => {
        let callFunction = () => {
            requireAuth()
        }
    
        expect(callFunction).not.toThrow()
    })
})
