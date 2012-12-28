/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

var Compbio = {
	formatNumber : function(position){
		return position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	},
	formatText : function(text, spaceChar){
		text = text.replace(new RegExp(spaceChar, "gi"), " ");
		text = text.charAt(0).toUpperCase() + text.slice(1);
		return text;
	},
	getPixelBaseByZoom : function (zoom){
		//zoom [0-100] intervals of 5
		zoom = Math.max(0,zoom);
		zoom = Math.min(100,zoom);
		return 10/(Math.pow(2,(20-(zoom/5))));
	},
	getZoomByPixelBase : function (pixelBase){
		//pixelBase [10 - 0];
		pixelBase = Math.max(0,pixelBase);
		pixelBase = Math.min(10,pixelBase);
		return 100-((Math.log(10/pixelBase)/(Math.log(2)))*5);
	},
	getPixelBaseByRegion : function (width, region){
		return width/region.length();
	},
	calculatePixelBaseAndZoomByRegion : function (args){
		var regionLength = this.regionLength(args.region);
		var pixelBase = args.width/regionLength;
		var baseWidth = parseInt(args.width/10);//10 is the max pixelbase at max zoom 100
		
		if(regionLength < baseWidth){//region is too small, start and end must be recalculated for the max allowed zoom
			pixelBase = this.getPixelBaseByZoom(args.zoom);
			var centerPosition = this.centerPosition(args.region);
			var aux = Math.ceil((baseWidth/2)-1);
			args.region.start = Math.floor(centerPosition-aux);
			args.region.end = Math.floor(centerPosition+aux);
			
			//modify the start and end
		}
		return {pixelBase:pixelBase,zoom:this.getZoomByPixelBase(pixelBase)}
	},
	isString : function (s) {
		return typeof(s) === 'string' || s instanceof String;
	},
	test : function(){
		return this;
	}
};

Compbio.randomColor = function(){
	var color = "";
	for(var i=0; i<6;i++){
		color += ([0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)]);
	}
	return "#"+color;
}

Compbio.images = {
	add:"data:image/gif;base64,R0lGODlhEAAQAIcAAD2GNUKNNkOPOESMO0WNPEmPP0iNQUmPQlOVTFWWTVCZQVeeRV6cVmGeWGSgVWSgV2aiWGejW2WrVWirU2uqWGqsW2yqWm61WG+1WG+1WXS3W3S3XHC4WXK5W3O6XHG+X3asZ3iuaHe8YHi0ZH+yany6ZH28Zn2+Z3m9bn25an25a3+5bUD/QHDBY3nBZHrGa3zDa37BaX7Hb4K1boO1boa3cYi4d4y7doq5eYm+eI2+e5O/f4HMdYbJeobJfIXNeYrCeY/CfYnIf4rPfZW/gozLgY7MhI7Sg5LFgJXAgpfHhZfMhZPNiJjLhpjMh5jMipvBl5vBmJTTipbTiZXUipbUi5fVi5nRi53YkqTOlKbPlqbQlqDZlaDZlqXbm6rUnavUnKbIoKfJoa/fpa/fprPZpbTZpbTaprLbqLPdqbXbqLfaqrTdqrXfrLbdrLjVr7jdr7vcr7rWsbfgr77itr3ktsTcuMXducXowMvmw87pydTrz9fu0tzx2ODy3P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAACwALAAAAAAQABAAAAi/AFkIHEiwoME7SWrMwCHH4MAdWfLs0QNnRQiHN+L4qeOlyxg8QCAU3LGmDxYmRqpQOTJHRYSBdpTw4SJFyJ8/P2DIaLNAjEAibsgU8YHiZgURHq4gaSCQBh0rPW5K/cMhxpcCAkmkGcJj6k0OJ8AMEGjjyZQXLSR85dBhiY4EAt9MYOPig4ivFzacEQBlIIgUaJByyIBBQxkLBwo6GKHGiYkSTcxQAODwgYIgW7TkCGDAocAwDAoQQBDFs2mCAQEAOw==",
	del:"data:image/gif;base64,R0lGODlhEAAQAIcAAED/QLpSNL9TOr5WOb5cQL9cQMFNM8RQNMBVPcBZP8xSPNBPPttWS9ddUcJnTMRkTMdrVM1gUc5iVMxmVclrVs1oWNZgVNZuZNtpZdxraN5ratxuadRxZd14c955dOZWTOZYTOZZTulZTelbT+ZWUOZaUuddWepcUOxfVOBlXO5mUuljW+pmXO5qXvBkVvNzXeNrYeNuY+FvcOJwZuJ7deR4ceJ5eeN4eeJ/feN/fOl7cOh6del/ePJ3Y/N5Y+qDfe6Efe+Gfu6KdfaCaPaEbPCFcPCDe/CMd/GOeviGcPiMdvCRf/eRfveTfvmSfvqTf/iUf9ymltynl+6Mge2Tju6Sj/SOgfqah/qdi/GclvGdluGpnvSgnvSinvWjn/qjkfupnPqrneGroOqwrOuzr/Ono/WmoferofarovWsofWvpfKtqvivpPS0qvi2qPm5r/q6rvC1tfC2tvjDvvzHuvnLxPnTzPzUzf3b1P3c2P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAAAALAAAAAAQABAAAAi6AAEIHEiwoEE5ODRk8EDG4EAbVObYqdNmxgWHMtbkgfMFCxg6OiQUvFEGz5UlSKA4UeImRoWBcX7cwdJECJGbRHywWSBGYA41YY6gGEq0hxUeFARuePOkiJ6nUEW00IJAIIYzSYZAjcoiywCBHaYweSGirNkRRmg8EDiGARoXKsyKAFHCy4EoAznASIPihIgQH0h0sVCgYIQUZoKsMAGES4MADico2FGlSg0DBBwK3AIhgQAHUjSLJhgQADs=",
	enable:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==",
	warning:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIsSURBVDjLpVNLSJQBEP7+h6uu62vLVAJDW1KQTMrINQ1vPQzq1GOpa9EppGOHLh0kCEKL7JBEhVCHihAsESyJiE4FWShGRmauu7KYiv6Pma+DGoFrBQ7MzGFmPr5vmDFIYj1mr1WYfrHPovA9VVOqbC7e/1rS9ZlrAVDYHig5WB0oPtBI0TNrUiC5yhP9jeF4X8NPcWfopoY48XT39PjjXeF0vWkZqOjd7LJYrmGasHPCCJbHwhS9/F8M4s8baid764Xi0Ilfp5voorpJfn2wwx/r3l77TwZUvR+qajXVn8PnvocYfXYH6k2ioOaCpaIdf11ivDcayyiMVudsOYqFb60gARJYHG9DbqQFmSVNjaO3K2NpAeK90ZCqtgcrjkP9aUCXp0moetDFEeRXnYCKXhm+uTW0CkBFu4JlxzZkFlbASz4CQGQVBFeEwZm8geyiMuRVntzsL3oXV+YMkvjRsydC1U+lhwZsWXgHb+oWVAEzIwvzyVlk5igsi7DymmHlHsFQR50rjl+981Jy1Fw6Gu0ObTtnU+cgs28AKgDiy+Awpj5OACBAhZ/qh2HOo6i+NeA73jUAML4/qWux8mt6NjW1w599CS9xb0mSEqQBEDAtwqALUmBaG5FV3oYPnTHMjAwetlWksyByaukxQg2wQ9FlccaK/OXA3/uAEUDp3rNIDQ1ctSk6kHh1/jRFoaL4M4snEMeD73gQx4M4PsT1IZ5AfYH68tZY7zv/ApRMY9mnuVMvAAAAAElFTkSuQmCC",
	edit:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB80lEQVR42o2T30tTURzArb8ioiAI6kHoZeF7CGE/IISCUDNCqAeL3rIWPfSwByskYUEJIhSChBhJFAiNqMVYPqRuc4tcW3NLt3C7u3d3d3c/+nS+0GRK0134cC6c8/ncc+7ltgFt6jqgcCg6duGQYq84deoBR6lU0iqVSq1arfI/1Dxut3u0Htke6BC5UChgmuYm+XyeXC5HOp1GIsnQNJHJi3x/7WJh/CSLT9r7Rd4jAVlgWRa2bSOjYBgGmqaRyWQwkq9Y8wyhLb0BI0VuaRrfo671xoDIwmakWCyi6zrr36bILt/HXp1l7cNDioEZqnEvgYmr1paAOgYy1u/l3NrqHNngPWpFL8XodTa+3CD8YoCvz/o078i5o1sC29FT78kG7lCzfJgrl7ESvejLThLPuxk8fbhP3KaBVFCdeX7on9yP9bOHfPAu0bEzmKkg4jQNpEKzhOduqW1/xIoNUEpcQlM7WXl6Cj39Q9Y0D4Q/TRJ662Tx3WOS/guYsV42Fm4THe/G/B2T97Jz4OVwJ+hxImPn8Tj381k91TfShfErIvLuAde1Y9g+N7Z/FL/rBDODR8gmgpTL5To7B3o69zF8pR3Pg7PMT90kn47LJ22kaeCPghapidP4Lxy3bduUiVZktdaQH7AxcFAiUm0Rhzji/gUhbp0s2Zf2xwAAAABJRU5ErkJggg==",
	info:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJ1SURBVHjafJJdSJNhFMd/z3QzLWdZrnQmSA2DPqRCK4KuhIq66kLoAy/qoqCguqqL6JsgLwoKKhCMSIy6CDKKRFZZYYQRVhJl02nWmG5uc19u7/vuPV0lW7QOnIsHnt+P8z/Pg4gw26aZ0263uzEUCn2IxWJjXq/3JqBETLIZ8gkePLhfKyKy/Z5HHJf7xe0Jic/n65mejizPK0inUiSTKUSE0dHRhxf6JoSDb4Rjr4QDz0REJBgMtmczFrJKKYVSCjCYnPR/W1FuAwQSGjbHXAA0LRXKZnIm0NJpgAKvd/hSOBz2iIj0eiPS2vtDYsmUPH/uPg9YshklIrOyCb+/eUG5ve3au5C99W2AqGbgKivk8R4X1lSkv2pJZaNmmBQVWWeZnAiGoa+3KovdyBjsW2kn/SvK4Jcgtaf7cDqrGkQMUDkBcgXVS2tOHjp8dG2jOXT1yo5lYOpgFTB0wKTAOqdQMlqOoDD7EE8kREwGXr/oWTg4HjxONAklBayuKSUeT/hFTxrwnwlAMa8I1qyrP3H95RiQgUiC/RsWM+wZ6jIME0M38wtSM0mmojM4nc6mzr5xKDQgnWb/pmoedT29EU3pTMUS+QVKKerq6kqnI3EVHwmAplO8qBh7WTFnzpz9bOg6FovlfxGEixfOrfT6YxCOQ1rDUaIAG4EJ38+PAwNb/95Bzj8ITAZwLHbMT0yHw3N33YVwEnQDqss41VzPkaalX6Iz+m6Xy/Xp34JAAICR7187nLWuvbe6h9C0DA2uRTTVV9J++87OlpaWJxUVFf9+xj+1cfOWls6OO93Nq1zblMVm9flG3pcvXNPm90+E/777ewB+UIqdqtYXHAAAAABJRU5ErkJggg==",
	dir:"data:image/png;base64,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",
	r:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAOAA4ADg2H9OeAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHA4SCAqmpjkAAAFTSURBVDjLpZK9SgNBFIW/mwR/CNrEVSHYaCFYGbBJIRZ2dkP2KZSglQYLJTZ2iqgg2PgAkXmEWEetlEAaQZQYXYJGlEBksxZJ3FUxyeKFCzPDnG/OnBlxHIf/VAigVHoA4HD/YCNiGOm/Npcta/M0k9lqzfOFQgMgIgChiGGklVK/hFprlFJordMJ08QLCbQAIhLoZFcpRcQw0gnT3KhWqy6gJzhAUHq7unMLsrd75GZwVtxmYnCu1k6ktf62Fo5dAQsNQM465u49C5htT/Zmkr3dYX58rZmBPcpbLezr+cQeczOwKnVuHu99AR5fam4G5WdpDbuuhuYLAHbdhj4/AM8/sF5f6RfDl4OnSsV1sDizzOTQFNcX+a4BK/HVBiAkwnnukg/7Q/w4iEdnCYkgQRBgBBheSiZj0Wj0pJN4PZWaBspAUYKep21mIp72lvOj6wCfx45rfW1VdicAAAAASUVORK5CYII=",
	box:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHAwRAVvTmTAAAAK/SURBVDjLpZM9bFxFGEXPNzPvZ+39sb2xHceREjDQBwlDCqqIiiotokAghYKEjvSkQkKJkEiB0lOkoAHaBAokFCQKUATIIOLIMbHWrHfX+7zvvZk3MzQODUgU3PJK5+g2F/5n5N/Kb66/1NNK3hAxr4HcFqVuvfju18V/Cu58sPmMVnJZ4K32Qr+t8za+KnCz4kCUuiGibm5euTv5h+CL958/nxj1XivVF+e6C9TVhPmFdbROgEhwNU1d4m09UaJuInLjhct3DgDUh5ee7j14PLxulLvYP/0seadPkub88Wib0eB3bDkmxgbRoFPpxeCuKvjsyQIzOyqImT7/y8Mh++NveW7jLFmrx6m1NlWxz6PHA7otQ7tloAmYJE9isOeeCJRtIrULLLUTjsqG7+//xs72z7jZgCTNONlVJKEiuobW0jqSaoiet19dFQATJcc2FSFEciNoLYwOHcPDASvdjM5cQntxlbR9gqacoFSK84VsnOrkH11Zdmp0FFXjobSeCFgXSDS0Eo11ge7yGXSaU092UUlCaEpC8FK4tDcu4rzZ2a/S+bWI94HSAgFigDQD24Cvp4gIOp0juBJvC2L07B1Uc/Mtg9k7sHMbywZrA3lLECV4AtaCpAp79CcmzXHlhOBrAJrGyNbOVBY7qTO1C9r5EKyPSttAiJEs01SuQStFkrdp6gKd5AzHjixVxCDxp+1paZRUxoc4Kp36bndYbS53U5WlCq0CMYIPMY7GI0mNpiqmGK0oK4jIveGkPgRqfTBt3A8Pqtvrq52HtglnGh9XIaKUkCQ6nj6RyWBsmdXCtFI/bu2Fq5c+3roGzIAgWokCDNACOhfOLb781Ip+vd+RC2dXWibROkxKvvp1z376yZe7d4HpMdz8/YVjiQYyoA30Ti6la2++0n/n83vTW/e3ix1gcgzXgPchBoC/AFu/UBF5InryAAAAAElFTkSuQmCC",
	bluebox:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHAwTE5pcivoAAALsSURBVDjLXZPPaxxlGMc/77wz+3N2k822tWsTIrQFe/BWEKxKCV5UohdFhJ60p6rgUfpP6C0K4kHx0ENEkV7aElHwUikhFVosRGoTm83+3pnZnXfed2beHtItIQ98+Z6+H57nga8AsNYKDkYcEofcHvKZEEJYcSTszPzqL3fmf3+w/+a51tytby9d6D0N5UecGeBZ8MPv/jh9fy/6dKzMpVPHmvWdbl/XCvKn5Wbl6+ufrNwGssMgYa2VgFj58sZr7VB/LqX3zlKrydJzTTzXxdqcx90hO+0Bk2l8Z74i1z6+cOba5VfOqGeAb3579M/NR53T40xwrDGHFALPEUjn4LoMi0ktwWTKXqCIqAVrbyycvHj2hHYBR+bO8Q/Ov0imEzZ2xrRDRalQwC9LLBalUgaJQy+tU6gvIBJbv3j2RA4IFxDdICFa9ulMCrz/UgOs5kEwpeh57I4Nt/dzsmLOYlEThgFjUePp33IHoD9SJAbuTVyudRweixJvnVtg3/i00wpLPiwQ0hkO6YYKawWj0UjONqAfKHwDkxTqqeW/RHA3hO2+Zqk05e5wTD9KmOqMKDEUqoLNzU0PyF2AQaBoaIhiw0h6TIwgUDCODb5NiWJNlKREyhAozXwOW1tbFSmlcAHbD2KaytCdGgyWglfEs4LeNKeaa4axYRgpwlgTTTXVDDqdTslaewAYh4kNlKUbZsTGonOwCYwm1vq5Ft1AMYgU08SQR5o0gziOcRxHuoCNtdl6uPHX6/Vmi3Yyh9I5IoEgMdkgT9x+qJhEGrdQo77cJMuy+4DJskwLa60DOCtf3HhZpfZKtVx+L3x+sfCv8CFxTINd72HfodQ4aQp5fP24/v/Hd4Nf/5RSJmma6lkXZn1wPvvq5qndsbhS9esf/Zy/UEtzxnURfn8+/fuHV7m353mecV1XSym1lDI72kaxvr5e3N7eruyP0tpG/e3LK/rW2mLNUb7vm3K5nFarVdNqtbJer2dXV1fzJ6cDpboAZRAGAAAAAElFTkSuQmCC",
	newitem:"data:image/png;base64,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"
}

Compbio.genBamVariants = function(seq, size, x, y){
		var length = seq.length;
		var s = size/6;
		//if(x==null){x=0;}
		//if(y==null){y=0;}
		var d = "";
		for(var i = 0; i<length; i++){
			switch(seq.charAt(i)){
				case "A" : 
					d+="M"+((2.5*s)+x)+","+(y)+
					"l-"+(2.5*s)+","+(6*s)+
					"l"+s+",0"+
					"l"+(0.875*s)+",-"+(2*s)+
					"l"+(2.250*s)+",0"+
					"l"+(0.875*s)+","+(2*s)+
					"l"+s+",0"+
					"l-"+(2.5*s)+",-"+(6*s)+
					"l-"+(0.5*s)+",0"+
					"l0,"+s+
					"l"+(0.75*s)+","+(2*s)+
					"l-"+(1.5*s)+",0"+
					"l"+(0.75*s)+",-"+(2*s)+
					"l0,-"+s+
					" ";
					break;
				case "T" : 
					d+="M"+((0.5*s)+x)+","+(y)+
					"l0,"+s+
					"l"+(2*s)+",0"+
					"l0,"+(5*s)+
					"l"+s+",0"+
					"l0,-"+(5*s)+
					"l"+(2*s)+",0"+
					"l0,-"+s+
					" ";
					break;
				case "C" : 
					d+="M"+((5*s)+x)+","+((0*s)+y)+
					"l-"+(2*s)+",0"+
					"l-"+(2*s)+","+(2*s)+
					"l0,"+(2*s)+
					"l"+(2*s)+","+(2*s)+
					"l"+(2*s)+",0"+
					"l0,-"+s+
					"l-"+(1.5*s)+",0"+
					"l-"+(1.5*s)+",-"+(1.5*s)+
					"l0,-"+(1*s)+
					"l"+(1.5*s)+",-"+(1.5*s)+
					"l"+(1.5*s)+",0"+
					" ";
					break;
				case "G" : 
					d+="M"+((5*s)+x)+","+((0*s)+y)+
					"l-"+(2*s)+",0"+
					"l-"+(2*s)+","+(2*s)+
					"l0,"+(2*s)+
					"l"+(2*s)+","+(2*s)+
					"l"+(2*s)+",0"+
					"l0,-"+(3*s)+
					"l-"+(1*s)+",0"+
					"l0,"+(2*s)+
					"l-"+(0.5*s)+",0"+
					"l-"+(1.5*s)+",-"+(1.5*s)+
					"l0,-"+(1*s)+
					"l"+(1.5*s)+",-"+(1.5*s)+
					"l"+(1.5*s)+",0"+
					" ";
					break;
				case "N" : 
					d+="M"+((0.5*s)+x)+","+((0*s)+y)+
					"l0,"+(6*s)+
					"l"+s+",0"+
					"l0,-"+(4.5*s)+
					"l"+(3*s)+","+(4.5*s)+
					"l"+s+",0"+
					"l0,-"+(6*s)+
					"l-"+s+",0"+
					"l0,"+(4.5*s)+
					"l-"+(3*s)+",-"+(4.5*s)+
					" ";
					break;
				default:d+="M0,0";break;
			}
			x += size;
		}
		return d;
}
