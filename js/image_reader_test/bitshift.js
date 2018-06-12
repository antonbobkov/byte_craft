function letter(num){
    arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
    return arr[num] + ''
}

function byte_letters(num){
    return letter(num >> 4) + letter(num % 16)
}

function color_convert(r, g, b){
    r = Math.floor(r/256*8)
    g = Math.floor(g/256*8)
    b = Math.floor(b/256*4)

    return (r << 5) + (g << 2) + b
}

